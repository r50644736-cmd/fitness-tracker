package com.fitness.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "diet_logs")
@Data
@NoArgsConstructor
public class DietLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private LocalDate date;
    private String mealName;
    private Integer calories;
    private Integer proteinGrams;
    private Integer carbsGrams;
    private Integer fatsGrams;
}
