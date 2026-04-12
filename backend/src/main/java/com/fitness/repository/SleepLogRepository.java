package com.fitness.repository;

import com.fitness.model.SleepLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SleepLogRepository extends JpaRepository<SleepLog, Long> {
    List<SleepLog> findByUserIdOrderByDateDesc(Long userId);
    List<SleepLog> findByUserId(Long userId);
    Optional<SleepLog> findTopByUserIdOrderByDateDesc(Long userId);
}
