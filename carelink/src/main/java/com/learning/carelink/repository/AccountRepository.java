package com.learning.carelink.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.learning.carelink.entity.Account;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account ,Long> {
       Optional <Account>findByEmail(String email);
       boolean existsByEmail(String email);
    
}