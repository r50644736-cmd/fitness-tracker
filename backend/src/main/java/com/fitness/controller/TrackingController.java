package com.fitness.controller;

import com.fitness.model.*;
import com.fitness.repository.*;
import com.fitness.security.services.UserDetailsImpl;
import com.fitness.service.MlServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    @Autowired UserRepository userRepository;
    @Autowired WorkoutLogRepository workoutLogRepository;
    @Autowired DietLogRepository dietLogRepository;
    @Autowired SleepLogRepository sleepLogRepository;
    @Autowired HydrationLogRepository hydrationLogRepository;
    @Autowired MlServiceClient mlServiceClient;

    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    private User getCurrentUser() {
        return userRepository.findById(getCurrentUserId()).orElseThrow();
    }

    // ─── PROFILE ──────────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        User user = getCurrentUser();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("age", user.getAge());
        profile.put("gender", user.getGender());
        profile.put("height", user.getHeight());
        profile.put("weight", user.getWeight());
        profile.put("fitnessGoal", user.getFitnessGoal());
        profile.put("activityLevel", user.getActivityLevel());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> updates) {
        User user = getCurrentUser();
        if (updates.containsKey("age"))           user.setAge(((Number) updates.get("age")).intValue());
        if (updates.containsKey("gender"))        user.setGender((String) updates.get("gender"));
        if (updates.containsKey("height"))        user.setHeight(((Number) updates.get("height")).doubleValue());
        if (updates.containsKey("weight"))        user.setWeight(((Number) updates.get("weight")).doubleValue());
        if (updates.containsKey("fitnessGoal"))   user.setFitnessGoal((String) updates.get("fitnessGoal"));
        if (updates.containsKey("activityLevel")) user.setActivityLevel((String) updates.get("activityLevel"));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    // ─── WORKOUTS ─────────────────────────────────────────────────────────────

    @PostMapping("/workout")
    public ResponseEntity<?> logWorkout(@RequestBody WorkoutLog log) {
        log.setUserId(getCurrentUserId());
        if (log.getDate() == null) log.setDate(LocalDate.now());
        workoutLogRepository.save(log);
        return ResponseEntity.ok(log);
    }

    @GetMapping("/workouts")
    public ResponseEntity<List<WorkoutLog>> getWorkouts() {
        return ResponseEntity.ok(workoutLogRepository.findByUserIdOrderByDateDesc(getCurrentUserId()));
    }

    @DeleteMapping("/workout/{id}")
    public ResponseEntity<?> deleteWorkout(@PathVariable Long id) {
        workoutLogRepository.findById(id).ifPresent(log -> {
            if (log.getUserId().equals(getCurrentUserId())) workoutLogRepository.delete(log);
        });
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    // ─── DIET ─────────────────────────────────────────────────────────────────

    @PostMapping("/diet")
    public ResponseEntity<?> logDiet(@RequestBody DietLog log) {
        log.setUserId(getCurrentUserId());
        if (log.getDate() == null) log.setDate(LocalDate.now());
        dietLogRepository.save(log);
        return ResponseEntity.ok(log);
    }

    @GetMapping("/diets")
    public ResponseEntity<List<DietLog>> getDiets() {
        return ResponseEntity.ok(dietLogRepository.findByUserIdOrderByDateDesc(getCurrentUserId()));
    }

    @DeleteMapping("/diet/{id}")
    public ResponseEntity<?> deleteDiet(@PathVariable Long id) {
        dietLogRepository.findById(id).ifPresent(log -> {
            if (log.getUserId().equals(getCurrentUserId())) dietLogRepository.delete(log);
        });
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    // ─── SLEEP ────────────────────────────────────────────────────────────────

    @PostMapping("/sleep")
    public ResponseEntity<?> logSleep(@RequestBody SleepLog log) {
        log.setUserId(getCurrentUserId());
        if (log.getDate() == null) log.setDate(LocalDate.now());
        sleepLogRepository.save(log);
        return ResponseEntity.ok(log);
    }

    @GetMapping("/sleep")
    public ResponseEntity<List<SleepLog>> getSleep() {
        return ResponseEntity.ok(sleepLogRepository.findByUserIdOrderByDateDesc(getCurrentUserId()));
    }

    @DeleteMapping("/sleep/{id}")
    public ResponseEntity<?> deleteSleep(@PathVariable Long id) {
        sleepLogRepository.findById(id).ifPresent(log -> {
            if (log.getUserId().equals(getCurrentUserId())) sleepLogRepository.delete(log);
        });
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    // ─── HYDRATION ────────────────────────────────────────────────────────────

    @PostMapping("/hydration")
    public ResponseEntity<?> logHydration(@RequestBody HydrationLog log) {
        log.setUserId(getCurrentUserId());
        if (log.getDate() == null) log.setDate(LocalDate.now());
        // Upsert today's entry
        hydrationLogRepository.findByUserIdAndDate(log.getUserId(), log.getDate())
            .ifPresentOrElse(existing -> {
                existing.setLitersConsumed(log.getLitersConsumed());
                existing.setDailyTargetLiters(log.getDailyTargetLiters());
                hydrationLogRepository.save(existing);
            }, () -> hydrationLogRepository.save(log));
        return ResponseEntity.ok(Map.of("message", "Hydration logged"));
    }

    @GetMapping("/hydration/today")
    public ResponseEntity<?> getTodayHydration() {
        return ResponseEntity.ok(
            hydrationLogRepository.findByUserIdAndDate(getCurrentUserId(), LocalDate.now())
                .orElse(null)
        );
    }

    // ─── DASHBOARD ────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        Long userId = getCurrentUserId();
        User user = getCurrentUser();

        List<WorkoutLog> allWorkouts = workoutLogRepository.findByUserIdOrderByDateDesc(userId);
        List<DietLog> allDiets = dietLogRepository.findByUserId(userId);
        List<DietLog> todayDiets = allDiets.stream()
            .filter(d -> LocalDate.now().equals(d.getDate()))
            .collect(Collectors.toList());

        Optional<SleepLog> latestSleep = sleepLogRepository.findTopByUserIdOrderByDateDesc(userId);
        Optional<HydrationLog> todayHydration = hydrationLogRepository.findByUserIdAndDate(userId, LocalDate.now());

        int totalCaloriesBurned = allWorkouts.stream().mapToInt(w -> w.getCaloriesBurned() != null ? w.getCaloriesBurned() : 0).sum();
        int totalCaloriesConsumed = todayDiets.stream().mapToInt(d -> d.getCalories() != null ? d.getCalories() : 0).sum();
        int totalProtein = todayDiets.stream().mapToInt(d -> d.getProteinGrams() != null ? d.getProteinGrams() : 0).sum();
        int totalCarbs = todayDiets.stream().mapToInt(d -> d.getCarbsGrams() != null ? d.getCarbsGrams() : 0).sum();
        int totalFats = todayDiets.stream().mapToInt(d -> d.getFatsGrams() != null ? d.getFatsGrams() : 0).sum();

        // Workout streak — count consecutive days ending today
        Set<LocalDate> workoutDates = allWorkouts.stream().map(WorkoutLog::getDate).filter(Objects::nonNull).collect(Collectors.toSet());
        int streak = 0;
        LocalDate check = LocalDate.now();
        while (workoutDates.contains(check)) { streak++; check = check.minusDays(1); }

        // Weekly workout counts for the bar chart (last 7 days)
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            long count = allWorkouts.stream().filter(w -> day.equals(w.getDate())).count();
            int cal = allWorkouts.stream().filter(w -> day.equals(w.getDate())).mapToInt(w -> w.getCaloriesBurned() != null ? w.getCaloriesBurned() : 0).sum();
            weeklyData.add(Map.of("date", day.toString(), "sessions", count, "calories", cal));
        }

        // ML recommendations
        double bmi = 0;
        if (user.getHeight() != null && user.getWeight() != null) {
            bmi = user.getWeight() / Math.pow(user.getHeight() / 100, 2);
        }

        int targetCalories = mlServiceClient.predictCalories(
            user.getAge() != null ? user.getAge() : 30,
            user.getWeight() != null ? user.getWeight() : 70.0,
            user.getHeight() != null ? user.getHeight() : 170.0,
            user.getGender() != null ? user.getGender() : "male",
            user.getActivityLevel() != null ? user.getActivityLevel() : "moderate"
        );

        String nextWorkout = mlServiceClient.recommendWorkout(
            user.getFitnessGoal() != null ? user.getFitnessGoal() : "maintenance",
            bmi,
            user.getActivityLevel() != null ? user.getActivityLevel() : "moderate"
        );

        // Readiness score based on sleep, streak, and HRV
        int readiness = 70;
        if (latestSleep.isPresent()) {
            SleepLog sl = latestSleep.get();
            int sleepScore = sl.getDurationHours() != null ? (int) Math.min(30, sl.getDurationHours() * 4) : 0;
            int hrvScore = sl.getHrvScore() != null ? Math.min(30, sl.getHrvScore() / 3) : 0;
            int streakScore = Math.min(20, streak * 2);
            readiness = 20 + sleepScore + hrvScore + streakScore;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("username", user.getUsername());
        stats.put("workouts", allWorkouts.subList(0, Math.min(5, allWorkouts.size())));
        stats.put("diets", todayDiets);
        stats.put("totalCaloriesBurned", totalCaloriesBurned);
        stats.put("totalCaloriesConsumed", totalCaloriesConsumed);
        stats.put("totalProtein", totalProtein);
        stats.put("totalCarbs", totalCarbs);
        stats.put("totalFats", totalFats);
        stats.put("targetCalories", targetCalories);
        stats.put("recommendedWorkoutType", nextWorkout);
        stats.put("workoutStreak", streak);
        stats.put("weeklyData", weeklyData);
        stats.put("readinessScore", readiness);
        stats.put("bmi", Math.round(bmi * 10.0) / 10.0);
        stats.put("latestSleep", latestSleep.orElse(null));
        stats.put("todayHydration", todayHydration.orElse(null));
        stats.put("totalWorkouts", allWorkouts.size());

        return ResponseEntity.ok(stats);
    }

    // ─── PERFORMANCE STATS ────────────────────────────────────────────────────

    @GetMapping("/stats/performance")
    public ResponseEntity<?> getPerformanceStats() {
        Long userId = getCurrentUserId();
        List<WorkoutLog> allWorkouts = workoutLogRepository.findByUserIdOrderByDateDesc(userId);
        List<SleepLog> sleepLogs = sleepLogRepository.findByUserIdOrderByDateDesc(userId);

        // Performance index based on consistency + volume
        int totalSessions = allWorkouts.size();
        double avgCalories = allWorkouts.stream().mapToInt(w -> w.getCaloriesBurned() != null ? w.getCaloriesBurned() : 0).average().orElse(0);
        double performanceIndex = Math.min(100, (totalSessions * 3) + (avgCalories / 50));

        // Active days this month
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        long activeDaysThisMonth = allWorkouts.stream()
            .filter(w -> w.getDate() != null && !w.getDate().isBefore(startOfMonth))
            .map(WorkoutLog::getDate).distinct().count();

        // Total steps estimate (approximation from cardio workouts)
        long totalStepsEst = allWorkouts.stream()
            .filter(w -> "cardio".equalsIgnoreCase(w.getType()))
            .mapToLong(w -> w.getDurationMinutes() != null ? w.getDurationMinutes() * 100L : 0)
            .sum();

        // Heatmap data: last 70 days (10 weeks x 7 days)
        List<Map<String, Object>> heatmap = new ArrayList<>();
        for (int i = 69; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            long count = allWorkouts.stream().filter(w -> day.equals(w.getDate())).count();
            int intensity = (int) Math.min(3, count);
            heatmap.add(Map.of("date", day.toString(), "intensity", intensity));
        }

        // Weekly performance for bar chart (last 12 weeks)
        List<Map<String, Object>> weeklyPerf = new ArrayList<>();
        for (int w = 11; w >= 0; w--) {
            LocalDate weekStart = LocalDate.now().minusWeeks(w).with(java.time.DayOfWeek.MONDAY);
            LocalDate weekEnd = weekStart.plusDays(6);
            List<WorkoutLog> weekWorkouts = workoutLogRepository.findByUserIdAndDateBetween(userId, weekStart, weekEnd);
            int totalCal = weekWorkouts.stream().mapToInt(wl -> wl.getCaloriesBurned() != null ? wl.getCaloriesBurned() : 0).sum();
            weeklyPerf.add(Map.of("week", weekStart.toString(), "sessions", weekWorkouts.size(), "calories", totalCal));
        }

        // Avg HRV from sleep logs
        double avgHrv = sleepLogs.stream()
            .filter(s -> s.getHrvScore() != null)
            .mapToInt(SleepLog::getHrvScore).average().orElse(72);

        // Muscle load estimation from workout types
        Map<String, Integer> muscleLoad = new HashMap<>();
        muscleLoad.put("chest", countTypeIntensity(allWorkouts, "push"));
        muscleLoad.put("back", countTypeIntensity(allWorkouts, "pull"));
        muscleLoad.put("legs", countTypeIntensity(allWorkouts, "legs"));
        muscleLoad.put("shoulders", countTypeIntensity(allWorkouts, "shoulders"));

        Map<String, Object> result = new HashMap<>();
        result.put("performanceIndex", Math.round(performanceIndex * 10.0) / 10.0);
        result.put("activeDaysThisMonth", activeDaysThisMonth);
        result.put("totalWorkouts", totalSessions);
        result.put("totalStepsEstimate", totalStepsEst);
        result.put("avgHrvScore", (int) avgHrv);
        result.put("heatmap", heatmap);
        result.put("weeklyPerformance", weeklyPerf);
        result.put("muscleLoad", muscleLoad);
        return ResponseEntity.ok(result);
    }

    private int countTypeIntensity(List<WorkoutLog> workouts, String keyword) {
        long count = workouts.stream()
            .filter(w -> w.getType() != null && w.getType().toLowerCase().contains(keyword))
            .count();
        return (int) Math.min(100, count * 15);
    }

    // ─── BIO-METRICS STATS ────────────────────────────────────────────────────

    @GetMapping("/stats/biometrics")
    public ResponseEntity<?> getBiometricsStats() {
        Long userId = getCurrentUserId();
        User user = getCurrentUser();
        List<SleepLog> sleepLogs = sleepLogRepository.findByUserIdOrderByDateDesc(userId);
        Optional<SleepLog> latestSleep = sleepLogs.stream().findFirst();
        Optional<HydrationLog> todayHydration = hydrationLogRepository.findByUserIdAndDate(userId, LocalDate.now());

        // Last 7 days HRV
        List<Map<String, Object>> hrvData = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            Optional<SleepLog> sl = sleepLogs.stream().filter(s -> day.equals(s.getDate())).findFirst();
            int hrv = sl.map(s -> s.getHrvScore() != null ? s.getHrvScore() : 0).orElse(0);
            hrvData.add(Map.of("date", day.toString(), "hrv", hrv));
        }

        // Sleep quality score from latest
        double sleepHours = latestSleep.map(s -> s.getDurationHours() != null ? s.getDurationHours() : 0.0).orElse(0.0);
        String sleepQuality = latestSleep.map(SleepLog::getQuality).orElse("unknown");
        String bedTime = latestSleep.map(s -> s.getBedTime() != null ? s.getBedTime() : "--:--").orElse("--:--");
        String wakeTime = latestSleep.map(s -> s.getWakeTime() != null ? s.getWakeTime() : "--:--").orElse("--:--");

        // BMR calculation (Mifflin-St Jeor)
        double bmr = 1500;
        if (user.getWeight() != null && user.getHeight() != null && user.getAge() != null) {
            if ("male".equalsIgnoreCase(user.getGender())) {
                bmr = 10 * user.getWeight() + 6.25 * user.getHeight() - 5 * user.getAge() + 5;
            } else {
                bmr = 10 * user.getWeight() + 6.25 * user.getHeight() - 5 * user.getAge() - 161;
            }
        }

        // Average HRV
        double avgHrv = sleepLogs.stream()
            .filter(s -> s.getHrvScore() != null)
            .mapToInt(SleepLog::getHrvScore).average().orElse(72);

        // Hydration today
        double litersToday = todayHydration.map(h -> h.getLitersConsumed() != null ? h.getLitersConsumed() : 0.0).orElse(0.0);
        double targetLiters = todayHydration.map(h -> h.getDailyTargetLiters() != null ? h.getDailyTargetLiters() : 4.0).orElse(4.0);

        Map<String, Object> result = new HashMap<>();
        result.put("avgHrvScore", (int) avgHrv);
        result.put("hrvData", hrvData);
        result.put("sleepHours", sleepHours);
        result.put("sleepQuality", sleepQuality);
        result.put("bedTime", bedTime);
        result.put("wakeTime", wakeTime);
        result.put("bmr", (int) bmr);
        result.put("todayLiters", litersToday);
        result.put("targetLiters", targetLiters);
        result.put("hydrationPercentage", targetLiters > 0 ? (int)((litersToday / targetLiters) * 100) : 0);
        return ResponseEntity.ok(result);
    }

    // ─── ARCHIVE ──────────────────────────────────────────────────────────────

    @GetMapping("/archive")
    public ResponseEntity<?> getArchive() {
        Long userId = getCurrentUserId();
        List<WorkoutLog> allWorkouts = workoutLogRepository.findByUserIdOrderByDateDesc(userId);

        // Build 10-week heatmap
        List<Map<String, Object>> heatmap = new ArrayList<>();
        for (int i = 69; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            long count = allWorkouts.stream().filter(w -> day.equals(w.getDate())).count();
            heatmap.add(Map.of("date", day.toString(), "intensity", (int) Math.min(3, count)));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("sessions", allWorkouts);
        result.put("heatmap", heatmap);
        result.put("totalSessions", allWorkouts.size());
        return ResponseEntity.ok(result);
    }
}
