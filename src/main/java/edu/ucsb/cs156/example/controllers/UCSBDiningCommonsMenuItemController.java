package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.UCSBDate;
import edu.ucsb.cs156.example.entities.UCSBDiningCommonsMenuItem;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.UCSBDiningCommonsMenuItemRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.time.LocalDateTime;


@Tag(name = "UCSBDiningCommonsMenuItem")
@RequestMapping("/api/ucsbdiningcommonsmenuitem")
@RestController
@Slf4j
public class UCSBDiningCommonsMenuItemController extends ApiController {
    @Autowired
    UCSBDiningCommonsMenuItemRepository ucsbDiningCommonsMenuItemRepository;

    // Get all records in the table and return as a JSON array
    @Operation(summary= "List all ucsb dinging commons menu item")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<UCSBDiningCommonsMenuItem> allUCSBDates() {
        Iterable<UCSBDiningCommonsMenuItem> items = ucsbDiningCommonsMenuItemRepository.findAll();
        return items;
    }

    // Use the data in the input parameters to create a new row in the table and return the data as JSON
    @Operation(summary= "Create a new date")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public UCSBDiningCommonsMenuItem postUCSBDiningCommonsMenuItem(
            @Parameter(name="diningCommonsCode") @RequestParam String diningCommonsCode,
            @Parameter(name="name") @RequestParam String name,
            @Parameter(name="station") @RequestParam String station)
            throws JsonProcessingException {


        UCSBDiningCommonsMenuItem ucsbDiningCommonsMenuItem = new UCSBDiningCommonsMenuItem();
        ucsbDiningCommonsMenuItem.setDiningCommonsCode(diningCommonsCode);
        ucsbDiningCommonsMenuItem.setName(name);
        ucsbDiningCommonsMenuItem.setStation(station);

        UCSBDiningCommonsMenuItem savedUCSBDiningCommonsMenuItem = ucsbDiningCommonsMenuItemRepository.save(ucsbDiningCommonsMenuItem);

        return savedUCSBDiningCommonsMenuItem;
    }
    
    /**
     * Get a single date by id
     * 
     * @param id the id of the date
     * @return a UCSBDate
     */
    @Operation(summary= "Get a single Dining Commons MenuItem by id")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public UCSBDiningCommonsMenuItem getById(
            @Parameter(name="id") @RequestParam Long id) {
            UCSBDiningCommonsMenuItem ucsbDiningCommonsMenuItem = ucsbDiningCommonsMenuItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(UCSBDiningCommonsMenuItem.class, id));

        return ucsbDiningCommonsMenuItem;
    }
    

    /**
     * Update a single date
     * 
     * @param id       id of the date to update
     * @param incoming the new date
     * @return the updated date object
     */
    @Operation(summary= "Update a single menu item")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public UCSBDiningCommonsMenuItem updaDiningCommonsMenuItem(
            @Parameter(name="id") @RequestParam Long id,
            @RequestBody @Valid UCSBDiningCommonsMenuItem incoming) {

            UCSBDiningCommonsMenuItem ucsbDiningCommonsMenuItem = ucsbDiningCommonsMenuItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(UCSBDiningCommonsMenuItem.class, id));

            ucsbDiningCommonsMenuItem.setDiningCommonsCode(incoming.getDiningCommonsCode());
            ucsbDiningCommonsMenuItem.setName(incoming.getName());
            ucsbDiningCommonsMenuItem.setStation(incoming.getStation());

            ucsbDiningCommonsMenuItemRepository.save(ucsbDiningCommonsMenuItem);

        return ucsbDiningCommonsMenuItem;
    }


    /**
     * Delete a UCSBDate
     * 
     * @param id the id of the menu item to delete
     * @return a message indicating the menu item was deleted
     */
    @Operation(summary= "Delete a UCSBDiningCommonsMenuItem")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteUCSBDiningCommonsMenuItem(
            @Parameter(name="id") @RequestParam Long id) {
            UCSBDiningCommonsMenuItem ucsbDiningCommonsMenuItem = ucsbDiningCommonsMenuItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(UCSBDiningCommonsMenuItem.class, id));

        ucsbDiningCommonsMenuItemRepository.delete(ucsbDiningCommonsMenuItem);
        return genericMessage("UCSBDiningCommonsMenuItem with id %s deleted".formatted(id));
    }
}
