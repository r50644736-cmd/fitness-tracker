package com.fitness.repository;

import com.fitness.model.HydrationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HydrationLogRepository extends JpaRepository<HydrationLog, Long> {
    List<HydrationLog> findByUserId(Long userId);
    Optional<HydrationLog> findByUserIdAndDate(Long userId, LocalDate date);
}
