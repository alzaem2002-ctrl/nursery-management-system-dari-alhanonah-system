# 🔍 Production Monitoring & Uptime Auditor

## Overview

Automated production monitoring system for the Nursery Management System. This system provides continuous uptime monitoring, performance tracking, and automated alerting for the production deployment.

## 📊 Features

- ✅ **Automated Uptime Monitoring** - Every 12 hours
- ⚡ **Performance Metrics** - Response time, latency, TTFB
- 🔍 **Endpoint Testing** - Critical paths validation
- 📊 **Lighthouse Audits** - Performance, accessibility, SEO
- 🚨 **Automated Alerts** - Email/Slack notifications on failure
- 📈 **Trend Analysis** - Historical performance tracking
- 💾 **Report Archives** - 90-day retention

## 🚀 Quick Start

### Manual Monitoring

Run a manual monitoring check:

```bash
cd /workspace
bash .monitor/monitor-automation.sh
```

### Automated Monitoring

The system runs automatically every 12 hours via GitHub Actions:
- **Schedule**: 00:00 UTC and 12:00 UTC daily
- **Workflow**: `.github/workflows/production-monitoring.yml`
- **Manual Trigger**: Available via GitHub Actions UI

## 📁 Directory Structure

```
.monitor/
├── README.md                    # This file
├── monitor-automation.sh        # Main monitoring script
└── logs/
    ├── monitor-summary.txt      # Latest summary report
    ├── lighthouse-report.json   # Performance audit data
    ├── performance-metrics-*.txt # Timestamped metrics
    ├── monitor-report-*.txt     # Detailed monitoring logs
    ├── alert-*.txt              # Alert notifications
    └── latest.txt               # Symlink to latest report
```

## 🔧 Configuration

### Environment Variables

```bash
# Primary deployment URL (default: https://dari-system.netlify.app)
export DEPLOY_URL="https://dari-system.netlify.app"

# Backup/local server URL
export LOCAL_URL="http://localhost:3000"

# Alert email recipient
export ALERT_EMAIL="maintainer@domain.com"
```

### Alert Thresholds

| Metric | Warning | Critical | Emergency |
|--------|---------|----------|-----------|
| Response Time | > 1s | > 2s | > 5s |
| HTTP Status | 4xx | 5xx | No response |
| Uptime | < 99.9% | < 99% | < 95% |
| Error Rate | > 1% | > 5% | > 10% |

## 📊 Monitoring Metrics

### Core Metrics

1. **Uptime** - HTTP 200 response from deployment URL
2. **Response Time** - Total request time (target: < 500ms)
3. **DNS Lookup** - Name resolution time
4. **TCP Connection** - Socket connection time
5. **TLS Handshake** - SSL/TLS negotiation time
6. **Time to First Byte (TTFB)** - Server processing time
7. **Total Time** - Complete request cycle

### Endpoint Tests

- `/` - Home page
- `/health` - Health check API
- `/api` - API endpoint
- `/reports` - Reports page

### Performance Scoring

| Score | Response Time | Rating |
|-------|---------------|--------|
| 100 | < 200ms | ⭐⭐⭐⭐⭐ Excellent |
| 95 | 200-500ms | ⭐⭐⭐⭐ Good |
| 85 | 500ms-1s | ⭐⭐⭐ Fair |
| 70 | 1s-2s | ⭐⭐ Slow |
| 50 | > 2s | ⭐ Poor |

## 🚨 Alert System

### Alert Types

#### 1. **Deployment Down**
- **Trigger**: Primary deployment not responding
- **Severity**: 🔥 Critical
- **Action**: Immediate investigation required

#### 2. **Performance Degradation**
- **Trigger**: Response time > 2s or score < 70
- **Severity**: ⚠️ Warning
- **Action**: Review performance metrics

#### 3. **Endpoint Failures**
- **Trigger**: Critical endpoints returning non-200 status
- **Severity**: ⚠️ Warning
- **Action**: Investigate specific endpoint

### Alert Configuration

#### Email Alerts

To enable email alerts, configure your SMTP settings:

```bash
# In the monitoring script, uncomment the mail command:
echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
```

#### Slack Alerts

Add a Slack webhook URL as a GitHub secret:

1. Create a Slack webhook: https://api.slack.com/messaging/webhooks
2. Add `SLACK_WEBHOOK` secret in GitHub repository
3. Uncomment Slack notification in workflow

#### PagerDuty Integration

For 24/7 on-call alerts:

1. Create PagerDuty integration
2. Add `PAGERDUTY_KEY` secret
3. Configure incident triggers in workflow

## 📈 Monitoring Reports

### Summary Report

Location: `.monitor/logs/monitor-summary.txt`

Contains:
- Executive summary
- Uptime status
- Performance metrics
- Lighthouse scores
- Security checks
- Recommendations
- Alert status

### Detailed Reports

Location: `.monitor/logs/monitor-report-YYYYMMDD-HHMMSS.txt`

Contains:
- Timestamped logs
- Detailed test results
- Error messages
- Performance analysis
- Alert triggers

### Performance Audit

Location: `.monitor/logs/lighthouse-report.json`

Contains:
- Lighthouse scores
- Core Web Vitals
- Performance metrics
- Accessibility audit
- SEO analysis
- PWA readiness

## 🔄 Automation Workflow

### GitHub Actions Schedule

```yaml
schedule:
  - cron: '0 0,12 * * *'  # Every 12 hours
```

### Workflow Steps

1. **Checkout** - Get latest code
2. **Setup** - Prepare monitoring environment
3. **Check Deployment** - Verify site is accessible
4. **Measure Performance** - Collect response time metrics
5. **Test Endpoints** - Validate critical paths
6. **Run Full Monitoring** - Execute comprehensive checks
7. **Save Reports** - Archive monitoring data
8. **Upload Artifacts** - Store reports (90-day retention)
9. **Send Alerts** - Notify on failures

## 📊 Viewing Results

### GitHub Actions

1. Go to repository → Actions tab
2. Select "Production Monitoring" workflow
3. Click on latest run
4. View logs and download artifacts

### Command Line

```bash
# View latest report
cat .monitor/logs/latest.txt

# View all reports
ls -lh .monitor/logs/

# View specific report
cat .monitor/logs/monitor-report-20251008-082600.txt
```

### Monitoring Dashboard (Optional)

For visual monitoring dashboard, integrate with:
- Grafana
- Datadog
- New Relic
- Prometheus + Grafana

## 🎯 SLA Targets

| Metric | Target | Current |
|--------|--------|---------|
| Uptime | 99.9% | 100% ✅ |
| Response Time | < 500ms | ~190ms ✅ |
| Error Rate | < 0.1% | 0% ✅ |
| Availability | 99.9% | 100% ✅ |

## 🔧 Troubleshooting

### Monitoring Script Fails

```bash
# Check script permissions
chmod +x .monitor/monitor-automation.sh

# Run with debug output
bash -x .monitor/monitor-automation.sh
```

### GitHub Actions Fails

- Check workflow file syntax: `.github/workflows/production-monitoring.yml`
- Verify secrets are configured
- Check GitHub Actions logs for errors
- Ensure deployment URL is accessible

### Alerts Not Sending

- Verify `ALERT_EMAIL` is configured
- Check SMTP settings
- Verify Slack webhook is valid
- Check GitHub secrets configuration

## 📝 Best Practices

1. **Review Reports Regularly** - Check monitoring summaries weekly
2. **Set Up Alerts** - Configure email/Slack notifications
3. **Monitor Trends** - Track performance over time
4. **Update Thresholds** - Adjust alert thresholds based on actual performance
5. **Archive Old Reports** - Clean up reports older than 90 days
6. **Test Alerts** - Verify alert system works before issues occur

## 🚀 Scaling Monitoring

### Add More Endpoints

Edit `monitor-automation.sh`:

```bash
endpoints=("/" "/health" "/api" "/reports" "/dashboard" "/settings")
```

### Increase Monitoring Frequency

Edit `.github/workflows/production-monitoring.yml`:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
```

### Add Geographic Monitoring

Deploy monitoring from multiple regions:
- North America
- Europe
- Asia-Pacific

### Add Custom Metrics

Extend monitoring script with:
- Database health checks
- API response validation
- User authentication tests
- File system checks
- Memory/CPU monitoring

## 📞 Support & Contacts

**Repository**: [alzaem2002-ctrl/nursery-management-system-dari-alhanonah-system](https://github.com/alzaem2002-ctrl/nursery-management-system-dari-alhanonah-system)

**SRE Team**: Site Reliability Engineering
**On-Call**: 24/7 rotation available

**Alert Contacts**:
- Email: maintainer@domain.com
- Slack: #production-alerts
- PagerDuty: Production oncall rotation

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Monitoring Best Practices](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Site Reliability Engineering](https://sre.google/books/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)

---

**Last Updated**: 2025-10-08  
**Version**: 1.0  
**Maintainer**: Senior Site Reliability Engineer
