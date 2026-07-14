import Criminal from '../models/Criminal.js';
import FIR from '../models/FIR.js';
import PhoneNumber from '../models/PhoneNumber.js';
import BankAccount from '../models/BankAccount.js';

class CriminalRepository {
  /**
   * Finds suspect criminal profiles matching first name, last name, or aliases
   */
  async findByName(name) {
    const cleanName = name.trim();
    return await Criminal.find({
      $or: [
        { firstName: new RegExp(cleanName, 'i') },
        { lastName: new RegExp(cleanName, 'i') },
        { aliases: new RegExp(cleanName, 'i') }
      ]
    })
    .populate('firs')
    .populate('phoneNumbers')
    .populate('bankAccounts')
    .exec();
  }

  /**
   * Retrieves repeat offenders: Suspects associated with multiple FIR registries
   */
  async findRepeatOffenders() {
    return await Criminal.find({
      $expr: { $gt: [{ $size: '$firs' }, 1] }
    })
    .populate('firs')
    .populate('phoneNumbers')
    .populate('bankAccounts')
    .limit(10)
    .exec();
  }
}

export default new CriminalRepository();
