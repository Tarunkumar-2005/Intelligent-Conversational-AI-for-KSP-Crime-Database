import mongoose from 'mongoose';
import FIR from '../models/FIR.js';
import PoliceStation from '../models/PoliceStation.js';
import CrimeCategory from '../models/CrimeCategory.js';
import Criminal from '../models/Criminal.js';
import Victim from '../models/Victim.js';
import CrimeLocation from '../models/CrimeLocation.js';

class AnalyticsRepository {
  /**
   * Translates incoming filter objects into Mongoose $match stages.
   * Leverages pre-queries on PoliceStation and CrimeCategory to keep indexes active.
   */
  async buildMatchStage(filters = {}) {
    const match = {};

    // 1. Date range boundaries
    if (filters.startDate || filters.endDate) {
      match.reportedDateTime = {};
      if (filters.startDate) {
        match.reportedDateTime.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        match.reportedDateTime.$lte = new Date(filters.endDate);
      }
    }

    // 2. Calendar Year constraint
    if (filters.year) {
      const yr = parseInt(filters.year, 10);
      if (!match.reportedDateTime) match.reportedDateTime = {};
      match.reportedDateTime.$gte = new Date(yr, 0, 1);
      match.reportedDateTime.$lte = new Date(yr, 11, 31, 23, 59, 59, 999);
    }

    // 3. Calendar Month constraint
    if (filters.month) {
      const mo = parseInt(filters.month, 10);
      match.$expr = match.$expr || { $and: [] };
      match.$expr.$and.push({ $eq: [{ $month: '$reportedDateTime' }, mo] });
    }

    // 4. Resolve Crime Category filter
    if (filters.crimeCategory) {
      if (mongoose.Types.ObjectId.isValid(filters.crimeCategory)) {
        match.crimeCategory = mongoose.Types.ObjectId.createFromHexString(filters.crimeCategory);
      } else {
        const cat = await CrimeCategory.findOne({ 
          name: new RegExp(filters.crimeCategory.trim(), 'i') 
        });
        if (cat) {
          match.crimeCategory = cat._id;
        } else {
          // If no matching category found, force match to return empty results
          match.crimeCategory = new mongoose.Types.ObjectId();
        }
      }
    }

    // 5. Resolve status filters
    const statusVal = filters.crimeStatus || filters.status;
    if (statusVal) {
      match.status = statusVal;
    }

    // 6. Resolve Police Station filter
    if (filters.policeStation) {
      if (mongoose.Types.ObjectId.isValid(filters.policeStation)) {
        match.policeStation = mongoose.Types.ObjectId.createFromHexString(filters.policeStation);
      } else {
        const station = await PoliceStation.findOne({ 
          name: new RegExp(filters.policeStation.trim(), 'i') 
        });
        if (station) {
          match.policeStation = station._id;
        } else {
          match.policeStation = new mongoose.Types.ObjectId();
        }
      }
    }

    // 7. Resolve District boundaries (Join lookup pre-query)
    if (filters.district) {
      const stations = await PoliceStation.find({ 
        district: new RegExp(filters.district.trim(), 'i') 
      }).select('_id');
      
      const stationIds = stations.map(s => s._id);
      match.policeStation = { $in: stationIds };
    }

    return match;
  }

  /**
   * Retrieves aggregated KPI metrics for overview cards
   */
  async getOverview(filters) {
    const match = await this.buildMatchStage(filters);

    const firStats = await FIR.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalFIRs: { $sum: 1 },
          activeInvestigations: {
            $sum: { $cond: [{ $eq: ['$status', 'Under Investigation'] }, 1, 0] }
          },
          closedCases: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = {
      totalFIRs: firStats[0]?.totalFIRs || 0,
      activeInvestigations: firStats[0]?.activeInvestigations || 0,
      closedCases: firStats[0]?.closedCases || 0,
      registeredCriminals: 0,
      repeatOffenders: 0,
      victims: 0,
      policeStations: 0,
      crimeCategories: 0
    };

    // Count unique suspects in filtered FIRs
    const suspectCount = await FIR.aggregate([
      { $match: match },
      { $unwind: '$suspects' },
      { $group: { _id: '$suspects' } },
      { $count: 'count' }
    ]);
    result.registeredCriminals = suspectCount[0]?.count || 0;

    // Count unique victims in filtered FIRs
    const victimCount = await FIR.aggregate([
      { $match: match },
      { $unwind: '$victims' },
      { $group: { _id: '$victims' } },
      { $count: 'count' }
    ]);
    result.victims = victimCount[0]?.count || 0;

    // Use global database statistics for static tables if no filters are active
    if (Object.keys(filters).length === 0) {
      result.registeredCriminals = await Criminal.countDocuments();
      result.victims = await Victim.countDocuments();
    }

    result.repeatOffenders = await Criminal.countDocuments({ $expr: { $gt: [{ $size: '$firs' }, 1] } });
    result.policeStations = await PoliceStation.countDocuments();
    result.crimeCategories = await CrimeCategory.countDocuments({ isActive: true });

    return result;
  }

  /**
   * Group incident counts by year and month for temporal crime trend line charts
   */
  async getCrimeTrends(filters) {
    const match = await this.buildMatchStage(filters);

    return await FIR.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$reportedDateTime' },
            month: { $month: '$reportedDateTime' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);
  }

  /**
   * Group incident counts by crime category for pie charts
   */
  async getCrimeTypes(filters) {
    const match = await this.buildMatchStage(filters);

    return await FIR.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$crimeCategory',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'crimecategories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: '$categoryInfo.name',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Group incident counts by district divisions for bar charts
   */
  async getDistricts(filters) {
    const match = await this.buildMatchStage(filters);

    return await FIR.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'policestations',
          localField: 'policeStation',
          foreignField: '_id',
          as: 'stationInfo'
        }
      },
      { $unwind: '$stationInfo' },
      {
        $group: {
          _id: '$stationInfo.district',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          district: '$_id',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Group incident counts by police station rankings for comparison charts
   */
  async getPoliceStations(filters) {
    const match = await this.buildMatchStage(filters);

    return await FIR.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'policestations',
          localField: 'policeStation',
          foreignField: '_id',
          as: 'stationInfo'
        }
      },
      { $unwind: '$stationInfo' },
      {
        $group: {
          _id: '$policeStation',
          stationName: { $first: '$stationInfo.name' },
          stationCode: { $first: '$stationInfo.stationCode' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          stationId: '$_id',
          stationName: 1,
          stationCode: 1,
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  }

  /**
   * Group incident counts by monthly calendar cycles for area charts
   */
  async getMonthly(filters) {
    const match = await this.buildMatchStage(filters);

    return await FIR.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $month: '$reportedDateTime' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          count: 1
        }
      },
      { $sort: { month: 1 } }
    ]);
  }

  /**
   * Group incident counts by yearly calendar cycles for trends comparison
   */
  async getYearly(filters) {
    const match = await this.buildMatchStage(filters);

    return await FIR.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $year: '$reportedDateTime' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          count: 1
        }
      },
      { $sort: { year: 1 } }
    ]);
  }

  /**
   * List repeat offenders sorted by the amount of associated active FIR files
   */
  async getRepeatOffenders() {
    return await Criminal.aggregate([
      {
        $project: {
          name: { $concat: ['$firstName', ' ', { $ifNull: ['$lastName', ''] }] },
          casesCount: { $size: '$firs' },
          status: 1,
          modusOperandi: 1
        }
      },
      { $match: { casesCount: { $gt: 1 } } },
      { $sort: { casesCount: -1 } },
      { $limit: 10 }
    ]);
  }

  /**
   * Group incident counts by crime location hotspots
   */
  async getTopCrimeLocations(filters) {
    const match = await this.buildMatchStage(filters);

    return await FIR.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'crimelocations',
          localField: 'occurrencePlace.location',
          foreignField: '_id',
          as: 'locationInfo'
        }
      },
      { $unwind: '$locationInfo' },
      {
        $group: {
          _id: '$occurrencePlace.location',
          locationName: { $first: '$locationInfo.locationName' },
          district: { $first: '$locationInfo.district' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          locationId: '$_id',
          locationName: 1,
          district: 1,
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  }

  /**
   * Group incident counts by investigation status for donut charts
   */
  async getInvestigationStatus(filters) {
    const match = await this.buildMatchStage(filters);

    return await FIR.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
  }
}

export default new AnalyticsRepository();
