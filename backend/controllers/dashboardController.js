const Event = require('../models/Event');
const Student = require('../models/Student');
const Registration = require('../models/Registration');

/**
 * @desc    Get dashboard metrics and quick summaries
 * @route   GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parallel metric counts
    const [totalEvents, upcomingEvents, totalStudents, totalRegistrations] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ eventDate: { $gte: today } }),
      Student.countDocuments(),
      Registration.countDocuments({ status: 'Registered' })
    ]);

    // Breakdown of events by category
    const categoryStats = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top 5 upcoming events
    const upcomingEventsList = await Event.find({ eventDate: { $gte: today } })
      .sort({ eventDate: 1 })
      .limit(5)
      .lean();

    const upcomingWithCounts = await Promise.all(
      upcomingEventsList.map(async (ev) => {
        const count = await Registration.countDocuments({ eventId: ev._id, status: 'Registered' });
        return {
          ...ev,
          registeredCount: count,
          seatsLeft: Math.max(0, ev.capacity - count)
        };
      })
    );

    // Top 5 most recent registrations
    const recentRegistrations = await Registration.find()
      .sort({ registrationDate: -1 })
      .limit(5)
      .populate('eventId', 'title category venue eventDate')
      .populate('studentId', 'name rollNo branch')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        totalStudents,
        totalRegistrations,
        categories: categoryStats.map((c) => ({ category: c._id, count: c.count })),
        upcomingEventsList: upcomingWithCounts,
        recentRegistrations
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
