package com.anders;

import com.matussek.coders.Base64;
import com.matussek.geo.GeoLocation;
import com.matussek.satellite.SGP4;
import com.matussek.satellite.Satellite;
import com.matussek.satellite.TLE;
import com.matussek.satellite.helpers.TLECoder;
import com.matussek.timezones.UTCTimeZone;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.text.DateFormat;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.TimeZone;
import javax.swing.JApplet;
import java.util.TimerTask;
import java.util.Timer;
import redis.clients.jedis.*;

public class ISSPosition extends TimerTask {
    private static final long serialVersionUID = 1L;
    private static final Locale DEFAULT_LOCALE = Locale.ENGLISH;
    private static final NumberFormat NF0 = NumberFormat.getNumberInstance(DEFAULT_LOCALE);
    private static final NumberFormat NF3 = NumberFormat.getNumberInstance(DEFAULT_LOCALE);
    private static final long TIME_INCREMENT = 60000L;
    private static final TimeZone UTC;
    private static final DateFormat UTC_TIME_FORMAT;
    private static boolean ready = false;
    private static long timeDifference;
    private static Satellite extSat;
    private static Jedis jedis = new Jedis("localhost");

    static
    {
	NF0.setMaximumFractionDigits(0);
	NF0.setMinimumFractionDigits(0);
	NF3.setMaximumFractionDigits(9);
	NF3.setMinimumFractionDigits(9);

	UTC = new UTCTimeZone();
	UTC_TIME_FORMAT = DateFormat.getTimeInstance(2, Locale.ENGLISH);

	UTC_TIME_FORMAT.setTimeZone(UTC);
    }

    private static void determineTimeDifference() {
	try {
	    URL codeBase = new URL("http://google.com/");
	    HttpURLConnection conn = (HttpURLConnection)codeBase.openConnection();
	    conn.setRequestMethod("HEAD");
	    conn.connect();
	    long serverTime = conn.getDate();
	    timeDifference = (System.currentTimeMillis() - serverTime);
	}
	catch (Exception localException)
	    {
	    }
    }

    public static String getSatelliteStateJSON()
    {
	long now = System.currentTimeMillis() - timeDifference;
	extSat.setTime(now);
	GeoLocation groundPoint = extSat.getGroundPoint();
	// feed.ISS [{"key":"ISS","points":[{"latitude":42.362512004571265,"longitude":-71.07954331157089,"altitude":10}]}]
	StringBuilder sb = new StringBuilder();
	sb.append("[{\"key\":\"ISS\",\"points\":[[0.0,");
	sb.append(NF3.format(Math.toDegrees(groundPoint.getLat())));
	sb.append(",");
	sb.append(NF3.format(Math.toDegrees(groundPoint.getLon())));
	sb.append(",");
	sb.append(NF0.format(extSat.getAltitude() * 0.001D));
	sb.append("]]}]");
	return sb.toString();
    }

    public static String getGroundTrackJSON() {
	StringBuilder sb = new StringBuilder();
	sb.append('[');
	long now = System.currentTimeMillis() - timeDifference;
	double anOrbitLater = now + (extSat.getOrbitalPeriod() * 1000.0D);
	for (long time = now; time <= anOrbitLater; time += 60000L) {
	    extSat.setTime(time);
	    GeoLocation groundPoint = extSat.getGroundPoint();
	    sb.append('[');
	    sb.append(NF3.format(Math.toDegrees(groundPoint.getLon())));
	    sb.append(',');
	    sb.append(NF3.format(Math.toDegrees(groundPoint.getLat())));
	    sb.append("],");
	}
	sb.deleteCharAt(sb.length() - 1);
	sb.append(']');
	return sb.toString();
    }
    public static double getOrbitalPeriod() {
	return extSat.getOrbitalPeriod();
    }

    public static void main(String[] args) {
	// decoded TLE:
	// line1="1 25544U 98067A   12095.19807755  .00017844  00000-0  22733-3 0  3021"
	// line2="2 25544  51.6423 132.8093 0013360 239.5397 193.3186 15.59310260766484"

	String codedTle = "/yWMyw1CQQwDW3EDL3LifDZHiqAbimcRPs1IIzuiKvONPex5AfDglvn1mSrASPqcTIC/PQQiRnqEi2L4J/4vQLl1huAKO9xb0KUmQmulHfjK5KfhZbVyRnO68+QXbLKtI4sAAAA=";
	determineTimeDifference();
	System.out.println("timeDifference:"+timeDifference);
	TLE tle = TLECoder.decode(codedTle);
	extSat = new SGP4(tle);

	Timer timer = new Timer();
	timer.schedule(new ISSPosition(), 0, 1000);

    }

    public void run() {
	String j = getSatelliteStateJSON();
	System.out.println(j);
	jedis.publish("feed.ISS",j);

    }

}
