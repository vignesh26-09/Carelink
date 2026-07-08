package com.learning.carelink.security;
import com.learning.carelink.entity.Account;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.List;
import java.util.Collection;
public class AccountUserDetails implements UserDetails {
    private final Account account;
    public AccountUserDetails (Account account){
           this.account=account;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        return List.of(new SimpleGrantedAuthority("ROLE_" + account.getRole().name()));
    }

    @Override
    public String getPassword(){
        return account.getPassword();
    }

    @Override 
    public String getUsername(){
        return account.getEmail();
    }

    @Override
    public boolean isAccountNonExpired(){
        return true;
    }

    @Override
    public boolean isAccountNonLocked(){
        return true;
    }
    @Override
    public boolean isCredentialsNonExpired(){
        return true;
    }
    @Override
    public boolean isEnabled(){
        return account.isActive();
    }
    //Optional
    public Account getAccount(){
       return this.account;
    }
}
