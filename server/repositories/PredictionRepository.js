import mongoose from 'mongoose';
import FIR from '../models/FIR.js';
import CrimeLocation from '../models/CrimeLocation.js';
import CrimeCategory from '../models/CrimeCategory.js';
import PoliceStation from '../models/PoliceStation.js';

class PredictionRepository {
  /**
   * Aggregates case counts grouped by year and month
   */
  async getMonthlyIncidentHistory(filters = {}) {
    const match = {};

    if (filters.district) {
      const stations = await PoliceStation.find({ 
        district: new RegExp(filters.district.trim(), 'i') 
      }).select('_id');
      match.policeStation = { $in: stations.map(s => s._id) };
    }

    if (filters.crimeCategory) {
      if (mongoose.Types.ObjectId.isValid(filters.crimeCategory)) {
        match.crimeCategory = mongoose.Types.ObjectId.createFromHexString(filters.crimeCategory);
      } else {
        const cat = await CrimeCategory.findOne({ name: new RegExp(filters.crimeCategory, 'i') });
        if (cat) match.crimeCategory = cat._id;
      }
    }

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
   * Aggregates hotspots by count of cases to find repeating locations
   */
  async getHistoricalHotspots(filters = {}) {
    const match = {};
    if (filters.district) {
      const stations = await PoliceStation.find({ 
        district: new RegExp(filters.district.trim(), 'i') 
      }).select('_id');
      match.policeStation = { $in: stations.map(s => s._id) };
    }

    return await FIR.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$occurrencePlace.location',
          count: { $sum: 1 }
        }
      },
      { $lookup: { from: 'crimelocations', localField: '_id', foreignField: '_id', as: 'loc' } },
      { $unwind: '$loc' },
      {
        $project: {
          _id: 0,
          locationId: '$_id',
          locationName: '$loc.locationName',
          district: '$loc.district',
          division: '$loc.division',
          coordinates: '$loc.coordinates.coordinates',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  }
}

export default new PredictionRepository();
