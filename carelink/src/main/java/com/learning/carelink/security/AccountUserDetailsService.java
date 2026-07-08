package com.learning.carelink.security;
import com.learning.carelink.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountUserDetailsService implements UserDetailsService{
     private final AccountRepository accountRepository;
    @Override 
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException{
                 return accountRepository.findByEmail(email)
                 .map(AccountUserDetails :: new)
                 .orElseThrow(()-> new UsernameNotFoundException("User not found"));
    }
}
