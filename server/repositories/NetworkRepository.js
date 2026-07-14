import mongoose from 'mongoose';
import Criminal from '../models/Criminal.js';
import FIR from '../models/FIR.js';
import Vehicle from '../models/Vehicle.js';
import PhoneNumber from '../models/PhoneNumber.js';
import BankAccount from '../models/BankAccount.js';
import CrimeLocation from '../models/CrimeLocation.js';

class NetworkRepository {
  parseObjectId(id) {
    if (!id) return null;
    if (id instanceof mongoose.Types.ObjectId) return id;
    if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
      return mongoose.Types.ObjectId.createFromHexString(id);
    }
    return null;
  }

  /**
   * Discovers the immediate graph neighborhood of a criminal
   */
  async getCriminalNeighborhood(id) {
    const criminalId = this.parseObjectId(id);

    if (!criminalId) return null;

    // Retrieve criminal dossier with phone numbers, bank accounts, and associated FIR files
    const criminal = await Criminal.findById(criminalId)
      .populate('phoneNumbers')
      .populate('bankAccounts')
      .populate({
        path: 'firs',
        populate: [
          { path: 'crimeCategory' },
          { path: 'suspects' }
        ]
      })
      .exec();

    if (!criminal) return null;

    const nodes = [];
    const edges = [];

    // 1. Criminal self node
    const selfNodeId = `criminal-${criminal._id}`;
    nodes.push({
      id: selfNodeId,
      label: `${criminal.firstName} ${criminal.lastName || ''}`.trim(),
      type: 'Criminal',
      metadata: {
        status: criminal.status,
        age: criminal.age,
        gender: criminal.gender,
        aliases: criminal.aliases,
        modusOperandi: criminal.modusOperandi
      }
    });

    // 2. Add phone number nodes & edges
    if (criminal.phoneNumbers && criminal.phoneNumbers.length > 0) {
      criminal.phoneNumbers.forEach(p => {
        const pNodeId = `phone-${p._id}`;
        nodes.push({
          id: pNodeId,
          label: p.phoneNumber,
          type: 'PhoneNumber',
          metadata: {
            serviceProvider: p.serviceProvider,
            ownerName: p.ownerName,
            isActive: p.isActive
          }
        });
        edges.push({
          source: selfNodeId,
          target: pNodeId,
          relationshipType: 'USES'
        });
      });
    }

    // 3. Add bank account nodes & edges
    if (criminal.bankAccounts && criminal.bankAccounts.length > 0) {
      criminal.bankAccounts.forEach(b => {
        const bNodeId = `bank-${b._id}`;
        nodes.push({
          id: bNodeId,
          label: b.accountNumber,
          type: 'BankAccount',
          metadata: {
            bankName: b.bankName,
            branchName: b.branchName,
            accountHolderName: b.accountHolderName
          }
        });
        edges.push({
          source: selfNodeId,
          target: bNodeId,
          relationshipType: 'OWNS'
        });
      });
    }

    // 4. Add FIR files nodes & associates edges
    if (criminal.firs && criminal.firs.length > 0) {
      criminal.firs.forEach(f => {
        const fNodeId = `fir-${f._id}`;
        nodes.push({
          id: fNodeId,
          label: f.firNumber,
          type: 'FIR',
          metadata: {
            status: f.status,
            crimeCategory: f.crimeCategory?.name || 'N/A',
            incidentDateTime: f.incidentDateTime
          }
        });
        edges.push({
          source: selfNodeId,
          target: fNodeId,
          relationshipType: 'INVOLVED_IN'
        });

        // Map co-suspect links (gang associates)
        if (f.suspects && f.suspects.length > 0) {
          f.suspects.forEach(s => {
            if (s._id.toString() !== criminal._id.toString()) {
              const assocNodeId = `criminal-${s._id}`;
              // Avoid duplicate node pushing
              if (!nodes.some(n => n.id === assocNodeId)) {
                nodes.push({
                  id: assocNodeId,
                  label: `${s.firstName} ${s.lastName || ''}`.trim(),
                  type: 'Criminal',
                  metadata: {
                    status: s.status,
                    modusOperandi: s.modusOperandi
                  }
                });
              }
              edges.push({
                source: selfNodeId,
                target: assocNodeId,
                relationshipType: 'ASSOCIATED_WITH',
                weight: 1
              });
            }
          });
        }
      });
    }

    return { nodes, edges };
  }

  /**
   * Discovers the immediate graph neighborhood of a FIR file
   */
  async getFIRNeighborhood(id) {
    const firId = this.parseObjectId(id);

    if (!firId) return null;

    const fir = await FIR.findById(firId)
      .populate('crimeCategory')
      .populate('suspects')
      .populate('victims')
      .populate('vehicles')
      .populate('evidence')
      .populate('occurrencePlace.location')
      .populate('policeStation')
      .exec();

    if (!fir) return null;

    const nodes = [];
    const edges = [];

    const selfNodeId = `fir-${fir._id}`;
    nodes.push({
      id: selfNodeId,
      label: fir.firNumber,
      type: 'FIR',
      metadata: {
        status: fir.status,
        crimeCategory: fir.crimeCategory?.name || 'N/A',
        briefFacts: fir.briefFacts,
        reportedDateTime: fir.reportedDateTime
      }
    });

    // 1. Crime Category node
    if (fir.crimeCategory) {
      const catNodeId = `category-${fir.crimeCategory._id}`;
      nodes.push({
        id: catNodeId,
        label: fir.crimeCategory.name,
        type: 'CrimeCategory',
        metadata: {
          severityLevel: fir.crimeCategory.severityLevel
        }
      });
      edges.push({
        source: selfNodeId,
        target: catNodeId,
        relationshipType: 'CATEGORIZED_AS'
      });
    }

    // 2. Suspects (Criminals)
    if (fir.suspects && fir.suspects.length > 0) {
      fir.suspects.forEach(s => {
        const sNodeId = `criminal-${s._id}`;
        nodes.push({
          id: sNodeId,
          label: `${s.firstName} ${s.lastName || ''}`.trim(),
          type: 'Criminal',
          metadata: {
            status: s.status,
            modusOperandi: s.modusOperandi
          }
        });
        edges.push({
          source: sNodeId,
          target: selfNodeId,
          relationshipType: 'INVOLVED_IN'
        });
      });
    }

    // 3. Victims
    if (fir.victims && fir.victims.length > 0) {
      fir.victims.forEach(v => {
        const vNodeId = `victim-${v._id}`;
        nodes.push({
          id: vNodeId,
          label: `${v.firstName} ${v.lastName || ''}`.trim(),
          type: 'Victim',
          metadata: {
            contactNumber: v.contactNumber
          }
        });
        edges.push({
          source: vNodeId,
          target: selfNodeId,
          relationshipType: 'INVOLVED_IN'
        });
      });
    }

    // 4. Vehicles
    if (fir.vehicles && fir.vehicles.length > 0) {
      fir.vehicles.forEach(veh => {
        const vehNodeId = `vehicle-${veh._id}`;
        nodes.push({
          id: vehNodeId,
          label: veh.vehicleNumber,
          type: 'Vehicle',
          metadata: {
            make: veh.make,
            model: veh.model,
            color: veh.color
          }
        });
        edges.push({
          source: vehNodeId,
          target: selfNodeId,
          relationshipType: 'INVOLVED_IN'
        });
      });
    }

    // 5. Evidence
    if (fir.evidence && fir.evidence.length > 0) {
      fir.evidence.forEach(ev => {
        const evNodeId = `evidence-${ev._id}`;
        nodes.push({
          id: evNodeId,
          label: ev.evidenceId || ev._id.toString(),
          type: 'Evidence',
          metadata: {
            name: ev.name,
            description: ev.description,
            type: ev.type
          }
        });
        edges.push({
          source: evNodeId,
          target: selfNodeId,
          relationshipType: 'ASSOCIATED_WITH'
        });
      });
    }

    // 6. Crime Location
    if (fir.occurrencePlace && fir.occurrencePlace.location) {
      const loc = fir.occurrencePlace.location;
      const locNodeId = `location-${loc._id}`;
      nodes.push({
        id: locNodeId,
        label: loc.locationName,
        type: 'CrimeLocation',
        metadata: {
          district: loc.district,
          division: loc.division
        }
      });
      edges.push({
        source: selfNodeId,
        target: locNodeId,
        relationshipType: 'LOCATED_AT'
      });
    }

    // 7. Police Station
    if (fir.policeStation) {
      const ps = fir.policeStation;
      const psNodeId = `station-${ps._id}`;
      nodes.push({
        id: psNodeId,
        label: ps.name,
        type: 'PoliceStation',
        metadata: {
          stationCode: ps.stationCode,
          district: ps.district
        }
      });
      edges.push({
        source: selfNodeId,
        target: psNodeId,
        relationshipType: 'LOCATED_AT'
      });
    }

    return { nodes, edges };
  }

  /**
   * Discovers neighbors for a Vehicle
   */
  async getVehicleNeighborhood(id) {
    const vehicleId = this.parseObjectId(id);

    if (!vehicleId) return null;

    const vehicle = await Vehicle.findById(vehicleId).exec();
    if (!vehicle) return null;

    const selfNodeId = `vehicle-${vehicle._id}`;
    const nodes = [{
      id: selfNodeId,
      label: vehicle.vehicleNumber,
      type: 'Vehicle',
      metadata: {
        make: vehicle.make,
        model: vehicle.model,
        color: vehicle.color,
        ownerName: vehicle.ownerName,
        isStolen: vehicle.isStolen
      }
    }];
    const edges = [];

    // Find FIRs involving this vehicle
    const firs = await FIR.find({ vehicles: vehicleId }).populate('suspects').exec();
    firs.forEach(f => {
      const fNodeId = `fir-${f._id}`;
      if (!nodes.some(n => n.id === fNodeId)) {
        nodes.push({
          id: fNodeId,
          label: f.firNumber,
          type: 'FIR',
          metadata: { status: f.status }
        });
      }
      edges.push({
        source: selfNodeId,
        target: fNodeId,
        relationshipType: 'INVOLVED_IN'
      });

      // Link any suspects involved in that FIR directly to this vehicle too!
      if (f.suspects && f.suspects.length > 0) {
        f.suspects.forEach(s => {
          const sNodeId = `criminal-${s._id}`;
          if (!nodes.some(n => n.id === sNodeId)) {
            nodes.push({
              id: sNodeId,
              label: `${s.firstName} ${s.lastName || ''}`.trim(),
              type: 'Criminal',
              metadata: { status: s.status }
            });
          }
          edges.push({
            source: sNodeId,
            target: selfNodeId,
            relationshipType: 'USES'
          });
        });
      }
    });

    return { nodes, edges };
  }

  /**
   * Discovers neighbors for a Phone Number
   */
  async getPhoneNeighborhood(id) {
    const phoneId = this.parseObjectId(id);

    if (!phoneId) return null;

    const phone = await PhoneNumber.findById(phoneId).exec();
    if (!phone) return null;

    const selfNodeId = `phone-${phone._id}`;
    const nodes = [{
      id: selfNodeId,
      label: phone.phoneNumber,
      type: 'PhoneNumber',
      metadata: {
        serviceProvider: phone.serviceProvider,
        ownerName: phone.ownerName,
        isActive: phone.isActive
      }
    }];
    const edges = [];

    // Find criminals referencing this phone number
    const suspects = await Criminal.find({ phoneNumbers: phoneId }).exec();
    suspects.forEach(s => {
      const sNodeId = `criminal-${s._id}`;
      nodes.push({
        id: sNodeId,
        label: `${s.firstName} ${s.lastName || ''}`.trim(),
        type: 'Criminal',
        metadata: { status: s.status }
      });
      edges.push({
        source: sNodeId,
        target: selfNodeId,
        relationshipType: 'USES'
      });
    });

    return { nodes, edges };
  }

  /**
   * Discovers neighbors for a Bank Account
   */
  async getBankNeighborhood(id) {
    const bankId = this.parseObjectId(id);

    if (!bankId) return null;

    const bank = await BankAccount.findById(bankId).exec();
    if (!bank) return null;

    const selfNodeId = `bank-${bank._id}`;
    const nodes = [{
      id: selfNodeId,
      label: bank.accountNumber,
      type: 'BankAccount',
      metadata: {
        bankName: bank.bankName,
        branchName: bank.branchName,
        accountHolderName: bank.accountHolderName
      }
    }];
    const edges = [];

    // Find criminals referencing this bank account
    const suspects = await Criminal.find({ bankAccounts: bankId }).exec();
    suspects.forEach(s => {
      const sNodeId = `criminal-${s._id}`;
      nodes.push({
        id: sNodeId,
        label: `${s.firstName} ${s.lastName || ''}`.trim(),
        type: 'Criminal',
        metadata: { status: s.status }
      });
      edges.push({
        source: sNodeId,
        target: selfNodeId,
        relationshipType: 'OWNS'
      });
    });

    return { nodes, edges };
  }

  /**
   * Discovers neighbors for a Crime Location
   */
  async getLocationNeighborhood(id) {
    const locId = this.parseObjectId(id);

    if (!locId) return null;

    const loc = await CrimeLocation.findById(locId).exec();
    if (!loc) return null;

    const selfNodeId = `location-${loc._id}`;
    const nodes = [{
      id: selfNodeId,
      label: loc.locationName,
      type: 'CrimeLocation',
      metadata: {
        district: loc.district,
        division: loc.division
      }
    }];
    const edges = [];

    // Find FIRs linked to this location
    const firs = await FIR.find({ 'occurrencePlace.location': locId }).exec();
    firs.forEach(f => {
      const fNodeId = `fir-${f._id}`;
      nodes.push({
        id: fNodeId,
        label: f.firNumber,
        type: 'FIR',
        metadata: { status: f.status }
      });
      edges.push({
        source: fNodeId,
        target: selfNodeId,
        relationshipType: 'LOCATED_AT'
      });
    });

    return { nodes, edges };
  }

  /**
   * General query search returning initial matching nodes
   */
  async searchEntities(query) {
    const nodes = [];
    const rx = new RegExp(query.trim(), 'i');

    // 1. Search Criminals
    const criminals = await Criminal.find({
      $or: [
        { firstName: rx },
        { lastName: rx },
        { aliases: rx }
      ]
    }).limit(5).exec();

    criminals.forEach(c => {
      nodes.push({
        id: `criminal-${c._id}`,
        label: `${c.firstName} ${c.lastName || ''}`.trim(),
        type: 'Criminal',
        metadata: { status: c.status }
      });
    });

    // 2. Search FIRs
    const firs = await FIR.find({ firNumber: rx }).limit(5).exec();
    firs.forEach(f => {
      nodes.push({
        id: `fir-${f._id}`,
        label: f.firNumber,
        type: 'FIR',
        metadata: { status: f.status }
      });
    });

    // 3. Search Vehicles
    const vehicles = await Vehicle.find({ vehicleNumber: rx }).limit(5).exec();
    vehicles.forEach(v => {
      nodes.push({
        id: `vehicle-${v._id}`,
        label: v.vehicleNumber,
        type: 'Vehicle',
        metadata: { make: v.make, model: v.model }
      });
    });

    return nodes;
  }
}

export default new NetworkRepository();
