import { Request, Response } from 'express';
import {
  applyPlatformFee,
  dbCreateProject,
  dbCreateProjectBid,
  dbGetProfessionals,
  dbGetProducts,
  dbGetProjectBids,
  dbGetProjects,
  dbGetRentals,
  getPlatformFeeBreakdownFromCustomerAmount,
  getPlatformFeeBreakdownFromVendorAmount,
} from '../../database/db';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await dbGetProjects();
    return res.json({ status: 'success', projects });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch projects' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, event_type, budget, location, description, contact_name, contact_phone, contact_email } = req.body;
    if (!title || !event_type || !budget || !location || !description || !contact_name || !contact_phone || !contact_email) {
      return res.status(400).json({ error: 'Project details, contact name, phone, and email are required.' });
    }

    const project = await dbCreateProject({
      title,
      event_type,
      budget: Number(budget),
      location,
      description,
      status: 'Open for Bids',
      contact_name,
      contact_phone,
      contact_email,
    });
    const { contact_name: _, contact_phone: __, contact_email: ___, ...publicProject } = project;
    return res.status(201).json({ message: 'Project RFP posted successfully', project: publicProject });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create project' });
  }
};

export const getAdminProjects = async (req: Request, res: Response) => {
  try {
    const projects = await dbGetProjects({ includeContact: true });
    const bids = await dbGetProjectBids();
    const [products, rentals, professionals] = await Promise.all([
      dbGetProducts(),
      dbGetRentals(),
      dbGetProfessionals(),
    ]);
    const listingFees = [
      ...products.map((item) => ({
        id: item.id,
        type: 'Product',
        title: item.name,
        pricing: getPlatformFeeBreakdownFromCustomerAmount(Number(item.price)),
      })),
      ...rentals.map((item) => ({
        id: item.id,
        type: 'Rental',
        title: item.item_name,
        pricing: getPlatformFeeBreakdownFromCustomerAmount(Number(item.daily_rate)),
      })),
      ...professionals.map((item) => ({
        id: item.id,
        type: 'Professional',
        title: item.name,
        pricing: getPlatformFeeBreakdownFromCustomerAmount(Number(item.hourly_rate)),
      })),
    ];
    const bidsWithPricing = bids.map((bid) => ({
      ...bid,
      pricing: getPlatformFeeBreakdownFromCustomerAmount(Number(bid.amount)),
    }));
    return res.json({ status: 'success', projects, bids: bidsWithPricing, listingFees });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch admin projects' });
  }
};

export const createProjectBid = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, message } = req.body;
    const projectId = Number(req.params.id);
    if (!projectId || !amount || !message) {
      return res.status(400).json({ error: 'Project, amount, and proposal message are required.' });
    }

    const vendorAmount = Number(amount);
    const bid = await dbCreateProjectBid({
      project_id: projectId,
      vendor_id: Number(req.user!.id) || 0,
      vendor_email: req.user!.email,
      amount: applyPlatformFee(vendorAmount),
      message,
    });

    return res.status(201).json({
      message: 'Project bid submitted successfully',
      bid,
      pricing: getPlatformFeeBreakdownFromVendorAmount(vendorAmount),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to submit bid' });
  }
};
