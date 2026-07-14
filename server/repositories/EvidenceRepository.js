import Evidence from '../models/Evidence.js';
import User from '../models/User.js';
import FIR from '../models/FIR.js';

class EvidenceRepository {
  /**
   * Finds evidence files collected for a specific FIR case ID
   */
  async findByFirId(firId) {
    return await Evidence.find({ fir: firId })
      .populate('collectedBy')
      .exec();
  }

  /**
   * Finds a specific piece of evidence by its custom ID (EVD-YYYY-XXXXX)
   */
  async findByEvidenceId(evidenceId) {
    return await Evidence.findOne({ 
      evidenceId: new RegExp(evidenceId.trim(), 'i') 
    })
    .populate('collectedBy')
    .populate('fir')
    .exec();
  }
}

export default new EvidenceRepository();
