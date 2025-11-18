/**
 * Utility functions for statistics calculations
 */

/**
 * Extract city from address string
 */
export function extractCity(address) {
  if (!address) return "Unknown";
  
  // Common Indonesian city patterns
  const cityPatterns = [
    /Jakarta\s+(Pusat|Selatan|Utara|Barat|Timur)/i,
    /Bandung/i,
    /Surabaya/i,
    /Yogyakarta/i,
    /Semarang/i,
    /Medan/i,
    /Makassar/i,
    /Palembang/i,
    /Denpasar/i,
  ];

  for (const pattern of cityPatterns) {
    const match = address.match(pattern);
    if (match) {
      return match[0];
    }
  }

  // Try to extract from common patterns like "Kota [City]" or "Kabupaten [City]"
  const kotaMatch = address.match(/(?:Kota|Kabupaten)\s+([A-Za-z\s]+)/i);
  if (kotaMatch) {
    return kotaMatch[1].trim();
  }

  return "Unknown";
}

/**
 * Get month abbreviation from date string
 */
export function getMonthAbbr(dateString) {
  if (!dateString) return "Unknown";
  
  try {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return months[date.getMonth()] || "Unknown";
  } catch {
    return "Unknown";
  }
}

/**
 * Calculate statistics from students data
 */
export function calculateStudentStats(students) {
  if (!students || !Array.isArray(students)) {
    return {
      total: 0,
      active: 0,
      completed: 0,
      notStarted: 0,
      pending: 0,
      approved: 0,
      inProgress: 0,
      finished: 0,
      rejected: 0,
      classes: [],
      specializations: [],
    };
  }

  const stats = {
    total: students.length,
    active: 0,
    completed: 0,
    notStarted: 0,
    pending: 0,
    approved: 0,
    inProgress: 0,
    finished: 0,
    rejected: 0,
    classes: {},
    specializations: {},
  };

  students.forEach((student) => {
    const internship = student.internshps?.[0] || student.internship;
    const status = internship?.status?.toLowerCase() || "not_started";

    // Count by internship status
    if (status === "approved" || status === "in_progress") {
      stats.active++;
    } else if (status === "finished" || status === "completed") {
      stats.completed++;
    } else if (status === "pending") {
      stats.pending++;
      stats.notStarted++;
    } else if (status === "rejected") {
      stats.rejected++;
      stats.notStarted++;
    } else {
      stats.notStarted++;
    }

    // Count by specific status
    if (status === "approved") stats.approved++;
    if (status === "in_progress") stats.inProgress++;
    if (status === "finished") stats.finished++;
    if (status === "rejected") stats.rejected++;

    // Count by class
    const kelas = student.KELAS || student.class || "Unknown";
    stats.classes[kelas] = (stats.classes[kelas] || 0) + 1;

    // Count by specialization (from company sector or specialist)
    if (internship?.company) {
      const specialization = internship.company.sector || internship.company.specialist || "Unknown";
      stats.specializations[specialization] = (stats.specializations[specialization] || 0) + 1;
    }
  });

  // Convert classes to array
  const classesArray = Object.entries(stats.classes).map(([name, count]) => ({
    name,
    count,
    specialization: name.includes("TKJ") ? "Jaringan" : name.includes("RPL") ? "Pemrograman" : "Lainnya",
  }));

  // Convert specializations to array
  const specializationsArray = Object.entries(stats.specializations)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / stats.total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 specializations

  return {
    ...stats,
    classes: classesArray,
    specializations: specializationsArray,
  };
}

/**
 * Calculate statistics from reports data
 */
export function calculateReportStats(reports) {
  if (!reports || !Array.isArray(reports)) {
    return {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      sent: 0,
      monthly: {},
      reports: [],
    };
  }

  const stats = {
    total: reports.length,
    approved: 0,
    pending: 0,
    rejected: 0,
    sent: 0,
    monthly: {},
  };

  // Process reports and calculate stats
  const processedReports = reports.map((report) => {
    const status = (report.status || "").toLowerCase() || "terkirim";
    const month = getMonthAbbr(report.created_at || report.date);

    // Count by status
    if (status === "disetujui" || status === "approved") {
      stats.approved++;
    } else if (status === "tertunda" || status === "pending") {
      stats.pending++;
    } else if (status === "ditolak" || status === "rejected") {
      stats.rejected++;
    } else if (status === "terkirim" || status === "sent") {
      stats.sent++;
      stats.pending++; // Count sent as pending
    }

    // Count by month
    if (month && month !== "Unknown") {
      if (!stats.monthly[month]) {
        stats.monthly[month] = { Disetujui: 0, Tertunda: 0, Ditolak: 0 };
      }

      if (status === "disetujui" || status === "approved") {
        stats.monthly[month].Disetujui++;
      } else if (status === "tertunda" || status === "pending" || status === "terkirim" || status === "sent") {
        stats.monthly[month].Tertunda++;
      } else if (status === "ditolak" || status === "rejected") {
        stats.monthly[month].Ditolak++;
      }
    }

    return {
      id: report.id,
      name: report.internship?.students?.users?.full_name || 
            report.internship?.student?.users?.full_name ||
            report.student_name ||
            report.title || 
            "Laporan",
      status: report.status,
      date: report.created_at || report.date,
      month: month,
      title: report.title,
      internship: report.internship,
    };
  });

  return {
    ...stats,
    reports: processedReports,
  };
}

/**
 * Calculate location statistics from companies and students
 */
export function calculateLocationStats(companies, students) {
  if (!companies || !Array.isArray(companies)) {
    return [];
  }

  const locationMap = {};

  // Group companies by city
  companies.forEach((company) => {
    const city = extractCity(company.address);
    if (!locationMap[city]) {
      locationMap[city] = {
        kota: city,
        lokasi: [],
        siswa: [],
      };
    }
    locationMap[city].lokasi.push(company.name);
    // Initialize siswa array with 0 for each company
    locationMap[city].siswa.push(0);
  });

  // Count students per company/city
  if (students && Array.isArray(students)) {
    students.forEach((student) => {
      const internship = student.internshps?.[0] || student.internship;
      const company = internship?.company;
      
      if (company) {
        const city = extractCity(company.address);
        if (locationMap[city]) {
          const companyIndex = locationMap[city].lokasi.findIndex((name) => name === company.name);
          if (companyIndex >= 0) {
            locationMap[city].siswa[companyIndex] = (locationMap[city].siswa[companyIndex] || 0) + 1;
          } else {
            // Company not in list, add it
            locationMap[city].lokasi.push(company.name);
            locationMap[city].siswa.push(1);
          }
        } else {
          // City not in map, create it
          const newCity = extractCity(company.address);
          locationMap[newCity] = {
            kota: newCity,
            lokasi: [company.name],
            siswa: [1],
          };
        }
      }
    });
  }

  // Filter out locations with 0 students if needed, or keep all
  return Object.values(locationMap);
}

/**
 * Calculate monthly progress from internships
 */
export function calculateMonthlyProgress(internships) {
  if (!internships || !Array.isArray(internships) || internships.length === 0) {
    return [];
  }

  const monthlyData = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

  internships.forEach((internship) => {
    if (!internship.start_date) return;

    try {
      const startDate = new Date(internship.start_date);
      const endDate = internship.end_date ? new Date(internship.end_date) : new Date();
      const today = new Date();

      // Get all months between start and end date
      const currentDate = new Date(startDate);
      while (currentDate <= endDate && currentDate <= today) {
        const monthIndex = currentDate.getMonth();
        const month = monthNames[monthIndex];
        
        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month]++;
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } catch (err) {
      console.warn("Error processing internship date:", err);
    }
  });

  // Convert to array and calculate percentages
  const maxCount = Math.max(...Object.values(monthlyData), 1);
  const result = Object.entries(monthlyData)
    .map(([month, count]) => ({
      month,
      count,
      percentage: Math.round((count / maxCount) * 100),
    }))
    .sort((a, b) => {
      const aIndex = monthNames.indexOf(a.month);
      const bIndex = monthNames.indexOf(b.month);
      return aIndex - bIndex;
    });

  // Return last 4 months if more than 4, otherwise return all
  return result.length > 4 ? result.slice(-4) : result;
}

