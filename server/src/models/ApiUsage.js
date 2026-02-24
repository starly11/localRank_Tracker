import mongoose from 'mongoose';

const apiUsageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const ApiUsage = mongoose.model('ApiUsage', apiUsageSchema);
export default ApiUsage;
