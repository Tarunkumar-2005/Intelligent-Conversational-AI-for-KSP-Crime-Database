import Victim from '../models/Victim.js';

class VictimRepository {
  /**
   * Finds victim or complainant profiles matching first name or last name
   */
  async findByName(name) {
    const cleanName = name.trim();
    return await Victim.find({
      $or: [
        { firstName: new RegExp(cleanName, 'i') },
        { lastName: new RegExp(cleanName, 'i') }
      ]
    }).exec();
  }
}

export default new VictimRepository();
