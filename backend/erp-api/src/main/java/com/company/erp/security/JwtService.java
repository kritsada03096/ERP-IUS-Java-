package com.company.erp.security;
import com.company.erp.model.entity.User;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
@Service
public class JwtService {
    private final JwtEncoder encoder;
    private final String issuer;
    private final long ttl;
    public JwtService(JwtEncoder encoder, @Value("${app.jwt.issuer}") String issuer, @Value("${app.jwt.ttl-minutes}") long ttl) {
        this.encoder = encoder; this.issuer = issuer; this.ttl = ttl;
    }
    public record Token(String value, Instant expiresAt) {}
    public Token issue(User user) {
        Instant now = Instant.now(), expires = now.plusSeconds(ttl * 60);
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer(issuer).subject(user.getUsername()).issuedAt(now).expiresAt(expires).build();
        return new Token(encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue(), expires);
    }
}
