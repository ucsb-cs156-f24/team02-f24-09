package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import edu.ucsb.cs156.example.entities.RecommendationRequest;

import java.time.LocalDateTime;

@Tag(name = "recommendationRequests")
@RequestMapping("/api/recommendationrequests")
@RestController
@Slf4j
public class RecommendationRequestsController extends ApiController {

    @Autowired
    private RecommendationRequestRepository recommendationRequestRepository;

    @Operation(summary = "List all recommendation requests")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<RecommendationRequest> getAllRequests() {
        return recommendationRequestRepository.findAll();
    }

    @Operation(summary = "Create a new recommendation request")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public RecommendationRequest createRecommendationRequest(
            @Parameter(description = "Email of the requester") @RequestParam String requesterEmail,
            @Parameter(description = "Email of the professor") @RequestParam String professorEmail,
            @Parameter(description = "Explanation for the request") @RequestParam String explanation,
            @Parameter(description = "Date when the recommendation was requested (ISO 8601 format)") 
            @RequestParam("dateRequested") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateRequested,
            @Parameter(description = "Date when the recommendation is needed (ISO 8601 format)") 
            @RequestParam("dateNeeded") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateNeeded,
            @Parameter(description = "Status of whether the request is completed") @RequestParam boolean doneBool
    ) throws JsonProcessingException {

        log.info("Request date: {}", dateRequested);
        log.info("Needed by: {}", dateNeeded);

        RecommendationRequest newRequest = RecommendationRequest.builder()
                .requesterEmail(requesterEmail)
                .professorEmail(professorEmail)
                .explanation(explanation)
                .dateRequested(dateRequested)
                .dateNeeded(dateNeeded)
                .done(doneBool)
                .build();

        return recommendationRequestRepository.save(newRequest);
    }

    /**
     * Get a specific recommendation request by its ID
     *
     * @param id the ID of the recommendation request
     * @return the corresponding RecommendationRequest
     */
    @Operation(summary = "Get a single recommendation request by ID")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public RecommendationRequest getRequestById(
            @Parameter(description = "ID of the recommendation request") @RequestParam Long id) {
        return recommendationRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));
    }

    /**
     * Delete a recommendation request by its ID
     *
     * @param id the ID of the recommendation request to be deleted
     * @return a message confirming the deletion
     */
    @Operation(summary = "Delete a recommendation request")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteRecommendationRequest(
            @Parameter(description = "ID of the recommendation request to delete") @RequestParam Long id) {
        RecommendationRequest request = recommendationRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

        recommendationRequestRepository.delete(request);
        return genericMessage(String.format("RecommendationRequest with id %s deleted", id));
    }

    /**
     * Update a recommendation request by its ID
     *
     * @param id       the ID of the recommendation request to be updated
     * @param incoming the new request data
     * @return the updated RecommendationRequest
     */
    @Operation(summary = "Update a recommendation request")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public RecommendationRequest updateRecommendationRequest(
               @Parameter(name="id") @RequestParam Long id,
            @RequestBody @Valid RecommendationRequest incoming) {

        RecommendationRequest req = recommendationRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

        req.setDateNeeded(incoming.getDateNeeded());
        req.setDateRequested(incoming.getDateRequested());
        req.setDone(incoming.getDone());
        req.setProfessorEmail(incoming.getProfessorEmail());
        req.setRequesterEmail(incoming.getRequesterEmail());
        req.setExplanation(incoming.getExplanation());

        recommendationRequestRepository.save(req);

        return req;
    
    }
}
