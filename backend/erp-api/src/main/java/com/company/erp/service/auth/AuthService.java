package com.company.erp.service.auth;
import com.company.erp.mapper.ErpMapper;
import com.company.erp.model.entity.User;
import com.company.erp.model.request.LoginRequest;
import com.company.erp.model.response.*;
import com.company.erp.repository.UserRepository;
import com.company.erp.security.JwtService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@Transactional(readOnly = true)
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final String dummyHash;
    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.encoder = encoder; this.jwt = jwt;
        this.dummyHash = encoder.encode(java.util.UUID.randomUUID().toString());
    }
    public LoginResponse login(LoginRequest request) {
        var user = users.findByUsername(request.username().trim());
        boolean valid = encoder.matches(request.password(), user.map(User::getPasswordHash).orElse(dummyHash));
        if (user.isEmpty() || !valid) throw new BadCredentialsException("Invalid credentials");
        var token = jwt.issue(user.get());
        return new LoginResponse(token.value(), token.expiresAt(), ErpMapper.user(user.get()));
    }
    public User currentUser() {
        return users.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName())
            .orElseThrow(() -> new BadCredentialsException("Unknown user"));
    }
    public UserResponse me() { return ErpMapper.user(currentUser()); }
}
