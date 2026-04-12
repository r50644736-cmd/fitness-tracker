package com.fitness.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@Service
public class MlServiceClient {

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Integer predictCalories(int age, double weight, double height, String gender, String activityLevel) {
        String url = mlServiceUrl + "/predict-calories";

        Map<String, Object> request = new HashMap<>();
        request.put("age", age);
        request.put("weight", weight);
        request.put("height", height);
        request.put("gender", gender);
        request.put("activity_level", activityLevel);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if(response.getBody() != null && response.getBody().containsKey("target_calories")) {
                return ((Number) response.getBody().get("target_calories")).intValue();
            }
        } catch (Exception e) {
            // fallback
        }
        return 2000;
    }

    public String recommendWorkout(String fitnessGoal, double bmi, String activityLevel) {
        String url = mlServiceUrl + "/recommend-workout";

        Map<String, Object> request = new HashMap<>();
        request.put("fitness_goal", fitnessGoal);
        request.put("bmi", bmi);
        request.put("activity_level", activityLevel);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if(response.getBody() != null && response.getBody().containsKey("recommended_workoutType")) {
                return (String) response.getBody().get("recommended_workoutType");
            }
        } catch (Exception e) {
            // fallback
        }
        return "mixed";
    }
}
