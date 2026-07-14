import mongoose from 'mongoose';
import Criminal from '../models/Criminal.js';
import FIR from '../models/FIR.js';
import Evidence from '../models/Evidence.js';

class ProfileRepository {
  /**
   * Finds a criminal by ID, returning their records
   */
  async findCriminalById(id) {
    let cleanId = id;
    if (typeof id === 'string') {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      cleanId = mongoose.Types.ObjectId.createFromHexString(id);
    }
    return await Criminal.findById(cleanId).exec();
  }

  /**
   * Finds a criminal by their name pattern
   */
  async findCriminalByName(name) {
    const rx = new RegExp(name.trim(), 'i');
    return await Criminal.findOne({
      $or: [
        { firstName: rx },
        { lastName: rx },
        { aliases: rx }
      ]
    }).exec();
  }

  /**
   * Scans FIR cases where the suspect's ID matches the target
   */
  async findCasesBySuspect(criminalId) {
    let cleanId = criminalId;
    if (typeof criminalId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(criminalId)) return [];
      cleanId = mongoose.Types.ObjectId.createFromHexString(criminalId);
    }
    return await FIR.find({ suspects: cleanId })
      .populate('crimeCategory', 'name severity')
      .populate('policeStation', 'name district')
      .populate('occurrencePlace.location', 'locationName coordinates')
      .sort({ reportedDateTime: -1 })
      .exec();
  }

  /**
   * Retrieves all criminals
   */
  async getAllCriminals() {
    return await Criminal.find({}).exec();
  }

  /**
   * Finds an FIR by ID, populated with category, station, victims, and evidence details
   */
  async findFirById(id) {
    let cleanId = id;
    if (typeof id === 'string') {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      cleanId = mongoose.Types.ObjectId.createFromHexString(id);
    }
    
    // Find the case
    const caseDoc = await FIR.findById(cleanId)
      .populate('crimeCategory', 'name severity')
      .populate('policeStation', 'name district')
      .populate('occurrencePlace.location', 'locationName coordinates')
      .populate('suspects', 'firstName lastName aliases gang affiliation risk')
      .populate('victims', 'name age gender phone')
      .exec();

    if (!caseDoc) return null;

    // Find linked evidence
    const evidence = await Evidence.find({ fir: cleanId }).exec();

    return {
      caseDoc,
      evidence
    };
  }

  /**
   * Finds all cases matching a specific crime category
   */
  async findCasesByCategory(categoryId) {
    return await FIR.find({ crimeCategory: categoryId })
      .populate('crimeCategory', 'name severity')
      .populate('policeStation', 'name district')
      .populate('occurrencePlace.location', 'locationName coordinates')
      .exec();
  }
}

export default new ProfileRepository();
