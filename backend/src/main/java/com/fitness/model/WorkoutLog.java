package com.fitness.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "workout_logs")
@Data
@NoArgsConstructor
public class WorkoutLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    
    private LocalDate date;
    private String type;        // cardio, strength, hiit, mobility
    private String name;        // e.g. "Push Day - Hypertrophy"
    private Integer durationMinutes;
    private String intensity;   // low, medium, high
    private Integer caloriesBurned;
    private Double volumeKg;    // total weight volume for strength
    private Integer sets;
    private Integer reps;
    private String notes;
}
