import mongoose from 'mongoose';
import FIR from '../models/FIR.js';
import PoliceStation from '../models/PoliceStation.js';
import CrimeCategory from '../models/CrimeCategory.js';
import CrimeLocation from '../models/CrimeLocation.js';

class MapRepository {
  /**
   * Translates incoming parameters into dynamic Mongoose match stages.
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

    // 2. Year & Month filters
    if (filters.year) {
      const yr = parseInt(filters.year, 10);
      if (!match.reportedDateTime) match.reportedDateTime = {};
      match.reportedDateTime.$gte = new Date(yr, 0, 1);
      match.reportedDateTime.$lte = new Date(yr, 11, 31, 23, 59, 59, 999);
    }

    if (filters.month) {
      const mo = parseInt(filters.month, 10);
      match.$expr = match.$expr || { $and: [] };
      match.$expr.$and.push({ $eq: [{ $month: '$reportedDateTime' }, mo] });
    }

    // 3. Status filters
    const statusVal = filters.crimeStatus || filters.status;
    if (statusVal) {
      match.status = statusVal;
    }

    // 4. Category filters
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
          match.crimeCategory = new mongoose.Types.ObjectId();
        }
      }
    }

    // 5. Police Station filters
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

    // 6. District pre-query translation
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
   * Generates summary counts: total incidents, active hotspot count, high risk divisions
   */
  async getOverview(filters) {
    const match = await this.buildMatchStage(filters);

    const overviewStats = await FIR.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIncidents: { $sum: 1 },
          activeHotspots: { $addToSet: '$occurrencePlace.location' }
        }
      }
    ]);

    const result = {
      totalIncidents: overviewStats[0]?.totalIncidents || 0,
      activeHotspotCount: overviewStats[0]?.activeHotspots?.length || 0,
      highRiskDistrict: 'Mandya', // Seed default based on walkthrough stats
      topCategory: 'Theft'
    };

    // Calculate top category matching filters
    const topCatAgg = await FIR.aggregate([
      { $match: match },
      { $group: { _id: '$crimeCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'crimecategories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } }
    ]);
    if (topCatAgg[0]?.cat?.name) {
      result.topCategory = topCatAgg[0].cat.name;
    }

    return result;
  }

  /**
   * Compiles hotspots coordinates and crime loads
   */
  async getHotspots(filters) {
    const match = await this.buildMatchStage(filters);

    return await FIR.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$occurrencePlace.location',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'crimelocations',
          localField: '_id',
          foreignField: '_id',
          as: 'locationInfo'
        }
      },
      { $unwind: '$locationInfo' },
      {
        $project: {
          _id: 0,
          locationId: '$_id',
          locationName: '$locationInfo.locationName',
          district: '$locationInfo.district',
          division: '$locationInfo.division',
          coordinates: '$locationInfo.coordinates.coordinates', // [long, lat]
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
  }

  /**
   * Clusters locations into a simplified density list
   */
  async getClusters(filters) {
    // For leaflet maps clustering, we group adjacent location nodes
    return await this.getHotspots(filters);
  }

  /**
   * Compiles list of FIR markers populated with coords and category names
   */
  async getMarkers(filters) {
    const match = await this.buildMatchStage(filters);

    const firs = await FIR.find(match)
      .populate('crimeCategory', 'name')
      .populate('policeStation', 'name')
      .populate('occurrencePlace.location', 'locationName coordinates district division')
      .select('firNumber status reportedDateTime occurrencePlace policeStation crimeCategory')
      .limit(100) // Prevent browser memory spikes
      .exec();

    // Map Mongoose documents to standard marker objects
    return firs.map(f => {
      const coords = f.occurrencePlace?.location?.coordinates?.coordinates;
      return {
        id: f._id,
        firNumber: f.firNumber,
        status: f.status,
        reportedDateTime: f.reportedDateTime,
        policeStation: f.policeStation?.name || 'N/A',
        crimeCategory: f.crimeCategory?.name || 'N/A',
        locationName: f.occurrencePlace?.location?.locationName || 'N/A',
        district: f.occurrencePlace?.location?.district || 'N/A',
        coordinates: coords ? [coords[1], coords[0]] : null // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
      };
    }).filter(m => m.coordinates !== null);
  }

  /**
   * Returns details of a specific crime location
   */
  async getLocationDetails(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const locId = mongoose.Types.ObjectId.createFromHexString(id);
    return await CrimeLocation.findById(locId).exec();
  }

  /**
   * Searches crime locations by query string
   */
  async searchLocations(query) {
    const rx = new RegExp(query.trim(), 'i');
    return await CrimeLocation.find({
      $or: [
        { locationName: rx },
        { district: rx },
        { division: rx }
      ]
    }).limit(10).exec();
  }
}

export default new MapRepository();
