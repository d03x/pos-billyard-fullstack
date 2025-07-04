import type { FastifyReply, FastifyRequest } from "fastify";
import { type PrismaClient } from "../generated/prisma/client";
import { formatRupiah } from "../formatRupiah";
import dayjs from "dayjs";

export class PoolStatsController {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get dashboard statistics
   */
  public async getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 1. Get all tables with their bookings
      const tables = await this.prisma.poolTables.findMany({
        include: {
          PoolBookings: {
            where: {
              createdAt: {
                gte: dayjs().startOf('day').toDate(),
                lte: dayjs().endOf('day').toDate()
              }
            }
          }
        }
      });

      // 2. Calculate statistics
      const availableTables = tables.filter(t => t.status === 'Available').length;
      const occupiedTables = tables.filter(t => t.status === 'Occupied').length;
      const maintenanceTables = tables.filter(t => t.status === 'Maintenance').length;
      
      const totalRevenue = tables.reduce((sum, table) => {
        return sum + table.PoolBookings.reduce((bookingSum, booking) => {
          return bookingSum + (booking.totalPrice || 0);
        }, 0);
      }, 0);

      // 3. Get recent bookings (last 5)
      const recentBookings = await this.prisma.poolBookings.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          poolTable: {
            select: {
              name: true
            }
          }
        }
      });

      // 4. Get today's active bookings
      const activeBookings = await this.prisma.poolBookings.count({
        where: {
          status: 'InProgress',
          startTime: {
            lte: new Date()
          },
          endTime: {
            gte: new Date()
          }
        }
      });

      // 5. Get hourly usage data
      const hourlyUsage = await this.getHourlyUsageStats();

      return reply.send({
        stats: {
          totalTables: tables.length,
          availableTables,
          occupiedTables,
          maintenanceTables,
          totalRevenue,
          activeBookings
        },
        recentBookings,
        hourlyUsage
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Get hourly usage statistics for the current day
   */
  private async getHourlyUsageStats() {
    const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23 hours
    
    const hourlyData = await Promise.all(
      hours.map(async (hour) => {
        const start = dayjs().startOf('day').add(hour, 'hour').toDate();
        const end = dayjs().startOf('day').add(hour + 1, 'hour').toDate();
        
        const bookings = await this.prisma.poolBookings.count({
          where: {
            OR: [
              {
                startTime: { lt: end },
                endTime: { gt: start }
              },
              {
                startTime: { gte: start },
                endTime: { lte: end }
              }
            ],
            status: { in: ['InProgress', 'Completed'] }
          }
        });
        
        return {
          hour: `${hour}:00`,
          bookings
        };
      })
    );
    
    return hourlyData;
  }

  /**
   * Get revenue statistics by time period
   */
  public async getRevenueStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { period = 'day' } = request.query as { period: 'day' | 'week' | 'month' };
      
      let startDate: Date;
      let groupBy: 'day' | 'week' | 'month';
      
      switch (period) {
        case 'week':
          startDate = dayjs().subtract(1, 'week').toDate();
          groupBy = 'day';
          break;
        case 'month':
          startDate = dayjs().subtract(1, 'month').toDate();
          groupBy = 'week';
          break;
        default: // day
          startDate = dayjs().subtract(1, 'day').toDate();
          groupBy = 'hour';
      }
      
      const rawData = await this.prisma.poolBookings.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: startDate,
            lte: new Date()
          },
          status: 'Completed'
        },
        _sum: {
          totalPrice: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      // Format data for chart
      const formattedData = rawData.map(item => ({
        date: dayjs(item.createdAt).format(groupBy === 'hour' ? 'HH:mm' : 'DD MMM'),
        revenue: item._sum.totalPrice || 0
      }));
      
      return reply.send({
        period,
        data: formattedData
      });
    } catch (error) {
      console.error('Error getting revenue stats:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Get table utilization statistics
   */
  public async getTableUtilization(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { days = 7 } = request.query as { days: number };
      
      const tables = await this.prisma.poolTables.findMany({
        include: {
          PoolBookings: {
            where: {
              createdAt: {
                gte: dayjs().subtract(days, 'day').toDate()
              },
              status: { in: ['Completed', 'InProgress'] }
            }
          }
        }
      });
      
      const utilization = tables.map(table => {
        const totalHours = table.PoolBookings.reduce((sum, booking) => {
          return sum + (booking.durationHours || 0);
        }, 0);
        
        const utilizationRate = (totalHours / (days * 24)) * 100;
        
        return {
          tableId: table.id,
          tableName: table.name,
          totalHours,
          utilizationRate: Math.min(100, utilizationRate), // Cap at 100%
          bookingsCount: table.PoolBookings.length
        };
      });
      
      return reply.send({
        periodDays: days,
        utilization
      });
    } catch (error) {
      console.error('Error getting table utilization:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}