import { Model, Schema, model } from 'mongoose';

import type { AdditionalService } from '../@types/data.js';
import { ADDITIONAL_SERVICES } from '../constants/constants.js';

export interface IService {
  name: AdditionalService;
  price: number;
}

export interface AdditionalServiceSummary {
  totalPrice: number;
  summary: Record<AdditionalService, number>;
}

export interface ServiceModel extends Model<IService> {
  calculateAdditionalServicePrice(services: AdditionalService[]): Promise<AdditionalServiceSummary>;
}

const serviceSchema = new Schema<IService, ServiceModel>({
  name: {
    type: String,
    required: true,
    enum: ADDITIONAL_SERVICES,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

serviceSchema.statics.calculateAdditionalServicePrice = async function (
  services: AdditionalService[],
) {
  const addServices = await Service.find({ name: { $in: services }});

  return {
    totalPrice: addServices.reduce((acc, service) => acc + service.price, 0),
    summary: addServices.reduce((sum, service) => {
      sum[service.name] = service.price;
      return sum;
    }, {} as Record<AdditionalService, number>),
  };
}

const Service = model<IService, ServiceModel>('Service', serviceSchema);

export default Service;
