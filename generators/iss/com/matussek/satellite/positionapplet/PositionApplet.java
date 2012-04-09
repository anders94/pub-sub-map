/*     */ package com.matussek.satellite.positionapplet;
/*     */ 
/*     */ import com.matussek.coders.Base64;
/*     */ import com.matussek.geo.GeoLocation;
/*     */ import com.matussek.satellite.SGP4;
/*     */ import com.matussek.satellite.Satellite;
/*     */ import com.matussek.satellite.TLE;
/*     */ import com.matussek.satellite.helpers.TLECoder;
/*     */ import com.matussek.timezones.UTCTimeZone;
/*     */ import java.net.HttpURLConnection;
/*     */ import java.net.URL;
/*     */ import java.security.MessageDigest;
/*     */ import java.text.DateFormat;
/*     */ import java.text.NumberFormat;
/*     */ import java.util.Locale;
/*     */ import java.util.TimeZone;
/*     */ import javax.swing.JApplet;
/*     */ 
/*     */ public class PositionApplet extends JApplet
/*     */ {
/*     */   private static final long serialVersionUID = 1L;
/*  32 */   private static final Locale DEFAULT_LOCALE = Locale.ENGLISH;
/*  33 */   private static final NumberFormat NF0 = NumberFormat.getNumberInstance(DEFAULT_LOCALE);
/*  34 */   private static final NumberFormat NF3 = NumberFormat.getNumberInstance(DEFAULT_LOCALE);
/*     */   private static final long TIME_INCREMENT = 60000L;
/*     */   private static final TimeZone UTC;
/*     */   private static final DateFormat UTC_TIME_FORMAT;
/*  50 */   private boolean ready = false;
/*  51 */   private boolean authorized = false;
/*     */   private long timeDifference;
/*     */   private Satellite extSat;
/*     */ 
/*     */   static
/*     */   {
/*  36 */     NF0.setMaximumFractionDigits(0);
/*  37 */     NF0.setMinimumFractionDigits(0);
/*  38 */     NF3.setMaximumFractionDigits(9);
/*  39 */     NF3.setMinimumFractionDigits(9);
/*     */ 
/*  43 */     UTC = new UTCTimeZone();
/*  44 */     UTC_TIME_FORMAT = DateFormat.getTimeInstance(2, Locale.ENGLISH);
/*     */ 
/*  46 */     UTC_TIME_FORMAT.setTimeZone(UTC);
/*     */   }
/*     */ 
/*     */   public void init()
/*     */   {
/*  61 */     this.authorized = true;
/*  62 */     if (this.authorized) {
/*  63 */       String codedTle = getParameter("data");
/*  64 */       if (codedTle != null) {
/*  65 */         determineTimeDifference();
/*     */ 
/*  67 */         TLE tle = TLECoder.decode(codedTle);
/*  68 */         this.extSat = new SGP4(tle);
/*     */       }
/*     */     }
/*  71 */     this.ready = true;
/*     */   }
/*     */ 
/*     */   private boolean checkAuthorized() {
/*  75 */     String hashParameter = getParameter("hash");
/*  76 */     if (hashParameter == null)
/*  77 */       return false;
/*  78 */     String sign = getClass().getName() + "+" + getCodeBase().toString();
/*     */     try {
/*  80 */       byte[] inBytes = sign.getBytes("UTF-8");
/*  81 */       MessageDigest md = MessageDigest.getInstance("MD5");
/*  82 */       md.reset();
/*  83 */       byte[] outBytes = md.digest(inBytes);
/*  84 */       String hash = Base64.encode(outBytes).substring(0, 22);
/*  85 */       return hashParameter.equals(hash); } catch (Exception e) {
/*     */     }
/*  87 */     return false;
/*     */   }
/*     */ 
/*     */   private void determineTimeDifference() {
/*  91 */     URL codeBase = getCodeBase();
/*     */     try {
/*  93 */       HttpURLConnection conn = (HttpURLConnection)codeBase.openConnection();
/*  94 */       conn.setRequestMethod("HEAD");
/*  95 */       conn.connect();
/*  96 */       long serverTime = conn.getDate();
/*  97 */       this.timeDifference = (System.currentTimeMillis() - serverTime);
/*     */     }
/*     */     catch (Exception localException)
/*     */     {
/*     */     }
/*     */   }
/*     */ 
/*     */   public boolean isReady() {
/* 105 */     return this.ready;
/*     */   }
/*     */ 
/*     */   public boolean isAuthorized()
/*     */   {
/* 110 */     return this.authorized;
/*     */   }
/*     */ 
/*     */   public String getSatelliteStateJSON()
/*     */   {
/* 116 */     long now = System.currentTimeMillis() - this.timeDifference;
/* 117 */     this.extSat.setTime(now);
/* 118 */     GeoLocation groundPoint = this.extSat.getGroundPoint();
/* 119 */     StringBuilder sb = new StringBuilder();
/* 120 */     sb.append('[');
/* 121 */     sb.append(now / 1000L);
/* 122 */     sb.append(',');
/* 123 */     sb.append(NF3.format(Math.toDegrees(groundPoint.getLon())));
/* 124 */     sb.append(',');
/* 125 */     sb.append(NF3.format(Math.toDegrees(groundPoint.getLat())));
/* 126 */     sb.append(',');
/* 127 */     sb.append(NF0.format(this.extSat.getAltitude() * 0.001D));
/* 128 */     sb.append(',');
/* 129 */     sb.append(NF0.format(this.extSat.getSpeed()));
/* 130 */     sb.append(']');
/* 131 */     return sb.toString();
/*     */   }
/*     */ 
/*     */   public String getGroundTrackJSON() {
/* 135 */     StringBuilder sb = new StringBuilder();
/* 136 */     sb.append('[');
/* 137 */     long now = System.currentTimeMillis() - this.timeDifference;
/* 138 */     double anOrbitLater = now + (this.extSat.getOrbitalPeriod() * 1000.0D);
/* 139 */     for (long time = now; time <= anOrbitLater; time += 60000L) {
/* 140 */       this.extSat.setTime(time);
/* 141 */       GeoLocation groundPoint = this.extSat.getGroundPoint();
/* 142 */       sb.append('[');
/* 143 */       sb.append(NF3.format(Math.toDegrees(groundPoint.getLon())));
/* 144 */       sb.append(',');
/* 145 */       sb.append(NF3.format(Math.toDegrees(groundPoint.getLat())));
/* 146 */       sb.append("],");
/*     */     }
/* 148 */     sb.deleteCharAt(sb.length() - 1);
/* 149 */     sb.append(']');
/* 150 */     return sb.toString();
/*     */   }
/*     */   public double getOrbitalPeriod() {
/* 153 */     return this.extSat.getOrbitalPeriod();
/*     */   }
/*     */ }

/* Location:           /Users/anders/t/ISS/satellite-position-applet_2012-01-31.jar
 * Qualified Name:     com.matussek.satellite.positionapplet.PositionApplet
 * JD-Core Version:    0.6.0
 */