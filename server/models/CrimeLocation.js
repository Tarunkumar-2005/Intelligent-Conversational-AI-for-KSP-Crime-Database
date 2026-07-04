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

const crimeLocationSchema = new mongoose.Schema(
  {
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
    policeStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceStation',
      required: [true, 'Associated Police Station is required.'],
      index: true,
    },
    locationName: {
      type: String,
      required: [true, 'Location name is required.'],
      trim: true,
    },
    coordinates: {
      type: pointSchema,
      required: [true, 'Geospatial coordinates are required.'],
    },
    areaCode: {
      type: String,
      trim: true,
    },
    locationType: {
      type: String,
      enum: {
        values: ['Residential', 'Commercial', 'Industrial', 'Public Space', 'Highway', 'Other'],
        message: 'Invalid location type. Must be Residential, Commercial, Industrial, Public Space, Highway, or Other.',
      },
      default: 'Other',
    },
    isHotspot: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index location geospatial coordinates
crimeLocationSchema.index({ coordinates: '2dsphere' });

const CrimeLocation = mongoose.model('CrimeLocation', crimeLocationSchema);

export default CrimeLocation;
