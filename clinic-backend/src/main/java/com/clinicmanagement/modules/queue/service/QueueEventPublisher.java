package com.clinicmanagement.modules.queue.service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service @Slf4j
public class QueueEventPublisher {
    private static final long TIMEOUT_MS = 30 * 60 * 1000L;
    private final List<SseEmitter> dashboardEmitters = new CopyOnWriteArrayList<>();
    private final List<SseEmitter> tvEmitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribeDashboard() { return register(dashboardEmitters); }
    public SseEmitter subscribeTv() { return register(tvEmitters); }

    private SseEmitter register(List<SseEmitter> emitters) {
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));
        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }
        return emitter;
    }

    public void publishUpdate() {
        broadcast(dashboardEmitters);
        broadcast(tvEmitters);
    }

    private void broadcast(List<SseEmitter> emitters) {
        emitters.removeIf(emitter -> {
            try {
                emitter.send(SseEmitter.event().name("refresh").data(System.currentTimeMillis()));
                return false;
            } catch (IOException e) {
                return true;
            }
        });
    }
}
