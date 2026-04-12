package com.fitness.repository;

import com.fitness.model.DietLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface DietLogRepository extends JpaRepository<DietLog, Long> {
    List<DietLog> findByUserId(Long userId);
    List<DietLog> findByUserIdAndDate(Long userId, LocalDate date);
    List<DietLog> findByUserIdOrderByDateDesc(Long userId);
}
