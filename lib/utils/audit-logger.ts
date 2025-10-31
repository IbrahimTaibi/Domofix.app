import { SecurityAuditLog } from '@/middleware'

// ============================================================================
// AUDIT LOGGER CONFIGURATION
// ============================================================================

interface AuditLoggerConfig {
  enableConsoleLogging: boolean
  enableFileLogging: boolean
  enableDatabaseLogging: boolean
  logLevel: 'low' | 'medium' | 'high' | 'critical'
  maxLogSize: number // in MB
  logRetentionDays: number
  alertThresholds: {
    failedAuthAttempts: number
    rateLimitViolations: number
    csrfViolations: number
    timeWindowMinutes: number
  }
}

const DEFAULT_CONFIG: AuditLoggerConfig = {
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableFileLogging: process.env.NODE_ENV === 'production',
  enableDatabaseLogging: true,
  logLevel: 'low',
  maxLogSize: 100, // 100MB
  logRetentionDays: 90,
  alertThresholds: {
    failedAuthAttempts: 5,
    rateLimitViolations: 10,
    csrfViolations: 3,
    timeWindowMinutes: 15
  }
}

// ============================================================================
// IN-MEMORY STORAGE FOR ALERTS
// ============================================================================

interface AlertTracker {
  [key: string]: {
    count: number
    firstOccurrence: Date
    lastOccurrence: Date
  }
}

const alertTracker: AlertTracker = {}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function shouldLog(logLevel: SecurityAuditLog['riskLevel'], configLevel: AuditLoggerConfig['logLevel']): boolean {
  const levels = { low: 0, medium: 1, high: 2, critical: 3 }
  return levels[logLevel] >= levels[configLevel]
}

function formatLogEntry(log: SecurityAuditLog): string {
  const timestamp = log.timestamp.toISOString()
  const userInfo = log.userId ? `[User: ${log.userId}]` : '[Anonymous]'
  const ipInfo = `[IP: ${log.ip}]`
  const statusInfo = log.success ? '[SUCCESS]' : '[FAILED]'
  const riskInfo = `[${log.riskLevel.toUpperCase()}]`
  
  let message = `${timestamp} ${riskInfo} ${statusInfo} ${userInfo} ${ipInfo} ${log.action} - ${log.route}`
  
  if (log.errorMessage) {
    message += ` | Error: ${log.errorMessage}`
  }
  
  return message
}

function getAlertKey(log: SecurityAuditLog): string {
  return `${log.ip}-${log.action}`
}

function checkAlertThresholds(log: SecurityAuditLog, config: AuditLoggerConfig): boolean {
  if (log.success) return false

  const alertKey = getAlertKey(log)
  const now = new Date()
  const windowStart = new Date(now.getTime() - config.alertThresholds.timeWindowMinutes * 60 * 1000)

  // Initialize or update tracker
  if (!alertTracker[alertKey]) {
    alertTracker[alertKey] = {
      count: 1,
      firstOccurrence: now,
      lastOccurrence: now
    }
    return false
  }

  const tracker = alertTracker[alertKey]
  
  // Reset if outside time window
  if (tracker.firstOccurrence < windowStart) {
    tracker.count = 1
    tracker.firstOccurrence = now
    tracker.lastOccurrence = now
    return false
  }

  // Update tracker
  tracker.count++
  tracker.lastOccurrence = now

  // Check thresholds
  const thresholds = config.alertThresholds
  
  switch (log.action) {
    case 'INVALID_AUTH_TOKEN':
    case 'MISSING_AUTH_TOKEN':
    case 'AUTHENTICATION_FAILED':
      return tracker.count >= thresholds.failedAuthAttempts
    
    case 'RATE_LIMIT_EXCEEDED':
      return tracker.count >= thresholds.rateLimitViolations
    
    case 'CSRF_VALIDATION_FAILED':
      return tracker.count >= thresholds.csrfViolations
    
    default:
      return false
  }
}

async function sendSecurityAlert(log: SecurityAuditLog, config: AuditLoggerConfig): Promise<void> {
  const alertKey = getAlertKey(log)
  const tracker = alertTracker[alertKey]
  
  const alertMessage = {
    timestamp: new Date().toISOString(),
    severity: 'HIGH',
    type: 'SECURITY_THRESHOLD_EXCEEDED',
    details: {
      action: log.action,
      ip: log.ip,
      route: log.route,
      userId: log.userId,
      occurrences: tracker.count,
      timeWindow: `${config.alertThresholds.timeWindowMinutes} minutes`,
      firstOccurrence: tracker.firstOccurrence.toISOString(),
      lastOccurrence: tracker.lastOccurrence.toISOString()
    }
  }

  // In a real application, you would send this to:
  // - Email notifications
  // - Slack/Discord webhooks
  // - Security monitoring systems (e.g., Datadog, New Relic)
  // - SMS alerts for critical issues
  
  console.error('🚨 SECURITY ALERT:', JSON.stringify(alertMessage, null, 2))
  
  // Example: Send to external monitoring service
  // await fetch(process.env.SECURITY_WEBHOOK_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(alertMessage)
  // })
}

async function logToConsole(log: SecurityAuditLog): Promise<void> {
  const formattedLog = formatLogEntry(log)
  
  switch (log.riskLevel) {
    case 'critical':
      console.error('🔴', formattedLog)
      break
    case 'high':
      console.warn('🟠', formattedLog)
      break
    case 'medium':
      console.warn('🟡', formattedLog)
      break
    case 'low':
      console.log('🟢', formattedLog)
      break
  }
}

async function logToFile(log: SecurityAuditLog): Promise<void> {
  // In a production environment, you would implement file logging
  // using libraries like winston, pino, or built-in fs module
  
  const logEntry = {
    ...log,
    timestamp: log.timestamp.toISOString()
  }
  
  // Example implementation:
  // const fs = require('fs').promises
  // const path = require('path')
  // const logDir = path.join(process.cwd(), 'logs')
  // const logFile = path.join(logDir, `security-${new Date().toISOString().split('T')[0]}.log`)
  // 
  // await fs.mkdir(logDir, { recursive: true })
  // await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n')
  
  // For now, we'll just log to console in production
  if (process.env.NODE_ENV === 'production') {
    console.log('AUDIT_LOG:', JSON.stringify(logEntry))
  }
}

async function logToDatabase(log: SecurityAuditLog): Promise<void> {
  try {
    // In a real application, you would save to your database
    // Example with MongoDB:
    // 
    // import connectDB from '@/lib/mongodb'
    // import AuditLog from '@/lib/models/AuditLog'
    // 
    // await connectDB()
    // const auditLog = new AuditLog(log)
    // await auditLog.save()
    
    // For now, we'll simulate database logging
    if (process.env.NODE_ENV === 'development') {
      console.log('DB_AUDIT_LOG:', JSON.stringify({
        ...log,
        timestamp: log.timestamp.toISOString()
      }))
    }
  } catch (error) {
    console.error('Failed to log to database:', error)
    // Fallback to file logging
    await logToFile(log)
  }
}

// ============================================================================
// MAIN AUDIT LOGGER CLASS
// ============================================================================

class AuditLogger {
  private config: AuditLoggerConfig

  constructor(config: Partial<AuditLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async log(log: SecurityAuditLog): Promise<void> {
    try {
      // Check if we should log based on risk level
      if (!shouldLog(log.riskLevel, this.config.logLevel)) {
        return
      }

      // Check for alert thresholds
      const shouldAlert = checkAlertThresholds(log, this.config)
      if (shouldAlert) {
        await sendSecurityAlert(log, this.config)
      }

      // Log to configured destinations
      const logPromises: Promise<void>[] = []

      if (this.config.enableConsoleLogging) {
        logPromises.push(logToConsole(log))
      }

      if (this.config.enableFileLogging) {
        logPromises.push(logToFile(log))
      }

      if (this.config.enableDatabaseLogging) {
        logPromises.push(logToDatabase(log))
      }

      await Promise.allSettled(logPromises)

    } catch (error) {
      console.error('Audit logger error:', error)
      // Always ensure critical security events are logged somewhere
      if (log.riskLevel === 'critical') {
        console.error('CRITICAL_SECURITY_EVENT:', JSON.stringify(log))
      }
    }
  }

  async logBatch(logs: SecurityAuditLog[]): Promise<void> {
    const logPromises = logs.map(log => this.log(log))
    await Promise.allSettled(logPromises)
  }

  updateConfig(newConfig: Partial<AuditLoggerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): AuditLoggerConfig {
    return { ...this.config }
  }

  // Utility method to create standardized log entries
  createLogEntry(
    ip: string,
    userAgent: string,
    action: string,
    route: string,
    success: boolean,
    options: {
      userId?: string
      errorMessage?: string
      riskLevel?: SecurityAuditLog['riskLevel']
    } = {}
  ): SecurityAuditLog {
    return {
      timestamp: new Date(),
      ip,
      userAgent,
      userId: options.userId,
      action,
      route,
      success,
      errorMessage: options.errorMessage,
      riskLevel: options.riskLevel || 'low'
    }
  }

  // Method to get recent security events (for monitoring dashboards)
  async getRecentEvents(
    timeWindowMinutes: number = 60,
    riskLevel?: SecurityAuditLog['riskLevel']
  ): Promise<SecurityAuditLog[]> {
    // In a real application, this would query your database
    // For now, return empty array
    return []
  }

  // Method to get security statistics
  async getSecurityStats(timeWindowHours: number = 24): Promise<{
    totalEvents: number
    failedAuthentications: number
    rateLimitViolations: number
    csrfViolations: number
    criticalEvents: number
    topIPs: Array<{ ip: string; count: number }>
  }> {
    // In a real application, this would aggregate data from your database
    return {
      totalEvents: 0,
      failedAuthentications: 0,
      rateLimitViolations: 0,
      csrfViolations: 0,
      criticalEvents: 0,
      topIPs: []
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const auditLogger = new AuditLogger()
export { AuditLogger }
export type { AuditLoggerConfig, SecurityAuditLog }