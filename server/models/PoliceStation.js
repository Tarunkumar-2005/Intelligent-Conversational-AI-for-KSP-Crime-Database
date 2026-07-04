import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Geospatial coordinates [longitude, latitude] are required.'],
      validate: {
        validator: function(val) {
          return (
            Array.isArray(val) &&
            val.length === 2 &&
            val[0] >= -180 &&
            val[0] <= 180 &&
            val[1] >= -90 &&
            val[1] <= 90
          );
        },
        message: 'Coordinates must be valid: [longitude (-180 to 180), latitude (-90 to 90)].',
      },
    },
  },
  { _id: false }
);

const policeStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Police station name is required.'],
      unique: true,
      trim: true,
    },
    stationCode: {
      type: String,
      required: [true, 'Station code is required.'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    district: {
      type: String,
      required: [true, 'District is required.'],
      trim: true,
    },
    division: {
      type: String,
      required: [true, 'Division is required.'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required.'],
      trim: true,
      match: [
        /^(\+91[\-\s]?)?[6-9]\d{9}$/,
        'Please provide a valid Indian mobile number.',
      ],
    },
    address: {
      type: String,
      required: [true, 'Physical address is required.'],
      trim: true,
    },
    location: {
      type: pointSchema,
      required: [true, 'Geospatial location coordinates are required.'],
    },
  },
  {
    timestamps: true,
  }
);

// Geo-spatial index for geospatial proximity queries
policeStationSchema.index({ location: '2dsphere' });

const PoliceStation = mongoose.model('PoliceStation', policeStationSchema);

export default PoliceStation;
