package com.fitness.repository;

import com.fitness.model.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByUserId(Long userId);
    List<WorkoutLog> findByUserIdOrderByDateDesc(Long userId);
    List<WorkoutLog> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
}
