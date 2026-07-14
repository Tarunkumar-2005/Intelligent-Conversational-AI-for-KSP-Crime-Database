import FIR from '../models/FIR.js';
import CrimeCategory from '../models/CrimeCategory.js';
import CrimeLocation from '../models/CrimeLocation.js';
import PoliceStation from '../models/PoliceStation.js';
import Criminal from '../models/Criminal.js';
import Victim from '../models/Victim.js';
import Evidence from '../models/Evidence.js';
import Vehicle from '../models/Vehicle.js';

class FIRRepository {
  /**
   * Finds a case incident by its exact or partial FIR number
   */
  async findByFirNumber(firNumber) {
    return await FIR.findOne({ 
      firNumber: new RegExp(firNumber.trim(), 'i') 
    })
    .populate('crimeCategory')
    .populate('policeStation')
    .populate('occurrencePlace.location')
    .populate('suspects')
    .populate('victims')
    .populate('evidence')
    .populate('vehicles')
    .exec();
  }

  /**
   * Queries FIR logs dynamically based on structured filters (category, city, year, month)
   */
  async findByFilters(filters) {
    const query = {};

    // 1. Resolve Crime Category reference
    if (filters.crimeType) {
      const category = await CrimeCategory.findOne({ 
        name: new RegExp(filters.crimeType, 'i') 
      });
      if (category) {
        query.crimeCategory = category._id;
      } else {
        // Return early with empty list if the specified category doesn't exist
        return [];
      }
    }

    // 2. Resolve Crime Locations by District/City
    if (filters.city) {
      const locations = await CrimeLocation.find({ 
        district: new RegExp(filters.city, 'i') 
      });
      if (locations.length > 0) {
        const locationIds = locations.map(loc => loc._id);
        query['occurrencePlace.location'] = { $in: locationIds };
      } else {
        return [];
      }
    }

    // 3. Resolve incidentDateTime bounds by Year
    if (filters.year) {
      const start = new Date(filters.year, 0, 1);
      const end = new Date(filters.year, 11, 31, 23, 59, 59);
      query.reportedDateTime = { $gte: start, $lte: end };
    }

    // 4. Resolve incidentDateTime by Month
    if (filters.month) {
      // Use MongoDB expression to compare months
      query.$expr = {
        $eq: [{ $month: '$reportedDateTime' }, filters.month]
      };
    }

    // 5. Resolve by Status
    if (filters.status) {
      query.status = new RegExp(filters.status, 'i');
    }

    // Execute query with full populated fields
    return await FIR.find(query)
      .populate('crimeCategory')
      .populate('policeStation')
      .populate('occurrencePlace.location')
      .populate('suspects')
      .populate('victims')
      .populate('evidence')
      .populate('vehicles')
      .limit(10) // Limit to avoid large payloads
      .exec();
  }
}

export default new FIRRepository();
