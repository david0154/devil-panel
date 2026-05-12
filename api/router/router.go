package router

import (
	"database/sql"

	"github.com/david0154/devil-panel/api/config"
	"github.com/david0154/devil-panel/api/handlers"
	"github.com/david0154/devil-panel/api/middleware"
	"github.com/david0154/devil-panel/api/services/cache"
	"github.com/gin-gonic/gin"
)

func Setup(r *gin.Engine, db *sql.DB, redis *cache.RedisClient, cfg *config.Config) {
	v1 := r.Group("/api/v1")

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db, redis, cfg)
	userHandler := handlers.NewUserHandler(db, cfg)
	serverHandler := handlers.NewServerHandler(db, cfg)
	domainHandler := handlers.NewDomainHandler(db, cfg)
	dnsHandler := handlers.NewDNSHandler(db, cfg)
	sslHandler := handlers.NewSSLHandler(db, cfg)
	emailHandler := handlers.NewEmailHandler(db, cfg)
	backupHandler := handlers.NewBackupHandler(db, cfg)
	monitorHandler := handlers.NewMonitorHandler(db, cfg)
	billingHandler := handlers.NewBillingHandler(db, cfg)
	aiHandler := handlers.NewAIHandler(db, cfg)
	wordpressHandler := handlers.NewWordPressHandler(db, cfg)
	firewallHandler := handlers.NewFirewallHandler(db, cfg)

	// ==============================
	// PUBLIC ROUTES (no auth needed)
	// ==============================
	pub := v1.Group("")
	{
		pub.POST("/auth/login", authHandler.Login)
		pub.POST("/auth/register", authHandler.Register)
		pub.POST("/auth/forgot-password", authHandler.ForgotPassword)
		pub.POST("/auth/reset-password", authHandler.ResetPassword)
		pub.GET("/auth/verify-email/:token", authHandler.VerifyEmail)
	}

	// ==============================
	// PROTECTED ROUTES (JWT required)
	// ==============================
	protected := v1.Group("")
	protected.Use(middleware.JWTAuthMiddleware(cfg))
	protected.Use(middleware.RateLimitMiddleware(redis, cfg))
	{
		// Auth
		protected.POST("/auth/logout", authHandler.Logout)
		protected.POST("/auth/refresh", authHandler.RefreshToken)
		protected.POST("/auth/2fa/enable", authHandler.Enable2FA)
		protected.POST("/auth/2fa/verify", authHandler.Verify2FA)

		// Users
		protected.GET("/users/me", userHandler.GetMe)
		protected.PUT("/users/me", userHandler.UpdateMe)
		protected.PUT("/users/me/password", userHandler.ChangePassword)
		protected.GET("/users/me/sessions", userHandler.GetSessions)
		protected.DELETE("/users/me/sessions/:id", userHandler.RevokeSession)

		// Servers
		protected.GET("/servers", serverHandler.List)
		protected.POST("/servers", serverHandler.Create)
		protected.GET("/servers/:id", serverHandler.Get)
		protected.PUT("/servers/:id", serverHandler.Update)
		protected.DELETE("/servers/:id", serverHandler.Delete)
		protected.POST("/servers/:id/reboot", serverHandler.Reboot)
		protected.POST("/servers/:id/start", serverHandler.Start)
		protected.POST("/servers/:id/stop", serverHandler.Stop)
		protected.GET("/servers/:id/stats", serverHandler.Stats)

		// Domains
		protected.GET("/domains", domainHandler.List)
		protected.POST("/domains", domainHandler.Create)
		protected.GET("/domains/:id", domainHandler.Get)
		protected.PUT("/domains/:id", domainHandler.Update)
		protected.DELETE("/domains/:id", domainHandler.Delete)
		protected.POST("/domains/:id/php-version", domainHandler.ChangePHPVersion)

		// DNS
		protected.GET("/dns/zones", dnsHandler.ListZones)
		protected.POST("/dns/zones", dnsHandler.CreateZone)
		protected.DELETE("/dns/zones/:zone", dnsHandler.DeleteZone)
		protected.GET("/dns/zones/:zone/records", dnsHandler.ListRecords)
		protected.POST("/dns/zones/:zone/records", dnsHandler.CreateRecord)
		protected.PUT("/dns/zones/:zone/records/:id", dnsHandler.UpdateRecord)
		protected.DELETE("/dns/zones/:zone/records/:id", dnsHandler.DeleteRecord)

		// SSL
		protected.GET("/ssl", sslHandler.List)
		protected.POST("/ssl/issue", sslHandler.Issue)
		protected.POST("/ssl/renew/:id", sslHandler.Renew)
		protected.DELETE("/ssl/:id", sslHandler.Delete)
		protected.POST("/ssl/:id/force-https", sslHandler.ForceHTTPS)

		// Email
		protected.GET("/email/accounts", emailHandler.ListAccounts)
		protected.POST("/email/accounts", emailHandler.CreateAccount)
		protected.DELETE("/email/accounts/:id", emailHandler.DeleteAccount)
		protected.PUT("/email/accounts/:id/password", emailHandler.ChangePassword)
		protected.GET("/email/forwarders", emailHandler.ListForwarders)
		protected.POST("/email/forwarders", emailHandler.CreateForwarder)

		// Backups
		protected.GET("/backups", backupHandler.List)
		protected.POST("/backups", backupHandler.Create)
		protected.POST("/backups/:id/restore", backupHandler.Restore)
		protected.DELETE("/backups/:id", backupHandler.Delete)

		// Monitoring
		protected.GET("/monitoring/stats", monitorHandler.GetStats)
		protected.GET("/monitoring/history", monitorHandler.GetHistory)
		protected.GET("/monitoring/processes", monitorHandler.GetProcesses)

		// Billing
		protected.GET("/billing/invoices", billingHandler.ListInvoices)
		protected.POST("/billing/pay", billingHandler.Pay)
		protected.GET("/billing/plans", billingHandler.ListPlans)

		// AI Assistant
		protected.POST("/ai/chat", aiHandler.Chat)
		protected.POST("/ai/analyze", aiHandler.AnalyzeServer)
		protected.GET("/ai/suggestions", aiHandler.GetSuggestions)

		// WordPress
		protected.GET("/wordpress", wordpressHandler.List)
		protected.POST("/wordpress/install", wordpressHandler.Install)
		protected.POST("/wordpress/:id/update", wordpressHandler.Update)
		protected.POST("/wordpress/:id/backup", wordpressHandler.Backup)
		protected.GET("/wordpress/:id/plugins", wordpressHandler.ListPlugins)

		// Firewall
		protected.GET("/firewall/rules", firewallHandler.ListRules)
		protected.POST("/firewall/rules", firewallHandler.CreateRule)
		protected.DELETE("/firewall/rules/:id", firewallHandler.DeleteRule)
		protected.POST("/firewall/block-ip", firewallHandler.BlockIP)
		protected.POST("/firewall/unblock-ip", firewallHandler.UnblockIP)
	}

	// ==============================
	// ADMIN ROUTES
	// ==============================
	admin := v1.Group("/admin")
	admin.Use(middleware.JWTAuthMiddleware(cfg))
	admin.Use(middleware.AdminMiddleware())
	{
		admin.GET("/users", userHandler.AdminListUsers)
		admin.PUT("/users/:id/suspend", userHandler.SuspendUser)
		admin.PUT("/users/:id/activate", userHandler.ActivateUser)
		admin.GET("/servers", serverHandler.AdminListAll)
		admin.GET("/stats", monitorHandler.AdminGlobalStats)
	}
}
