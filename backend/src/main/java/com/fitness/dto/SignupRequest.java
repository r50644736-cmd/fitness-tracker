package com.fitness.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String password;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private String fitnessGoal;
    private String activityLevel;
}
