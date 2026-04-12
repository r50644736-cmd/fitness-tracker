package com.fitness.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "sleep_logs")
@Data
@NoArgsConstructor
public class SleepLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private LocalDate date;
    private Double durationHours;
    private String quality;     // poor, fair, good, excellent
    private String bedTime;     // e.g. "22:30"
    private String wakeTime;    // e.g. "06:30"
    private Integer hrvScore;   // Heart Rate Variability score (ms)
}
