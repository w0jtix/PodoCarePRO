package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.ClientNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientNoteRepo extends JpaRepository<ClientNote, Long> {

    Optional<ClientNote> findOneById(Long id);

    List<ClientNote> findByClientId(Long clientId);
}
