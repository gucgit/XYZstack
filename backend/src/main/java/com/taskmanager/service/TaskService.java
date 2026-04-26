package com.taskmanager.service;

import com.taskmanager.model.Task;
import com.taskmanager.model.Task.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    public List<Task> getAllTasks() {
        log.info("Fetching all tasks");
        return taskRepository.findAllOrderByCreatedAtDesc();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Task not found with id: " + id));
    }

    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    public Task createTask(Task task) {
        log.info("Creating task: {}", task.getTitle());
        Task saved = taskRepository.save(task);
        log.info("Task created with id: {}", saved.getId());
        return saved;
    }

    public Task updateTask(Long id, Task updated) {
        Task existing = getTaskById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setStatus(updated.getStatus());
        existing.setPriority(updated.getPriority());
        existing.setDueDate(updated.getDueDate());
        return taskRepository.save(existing);
    }

    public Task updateStatus(Long id, TaskStatus newStatus) {
        Task existing = getTaskById(id);
        existing.setStatus(newStatus);
        return taskRepository.save(existing);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new NoSuchElementException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
        log.info("Task {} deleted", id);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getTaskStats() {
        return Map.of(
            "total",      taskRepository.count(),
            "todo",       taskRepository.countByStatus(TaskStatus.TODO),
            "inProgress", taskRepository.countByStatus(TaskStatus.IN_PROGRESS),
            "done",       taskRepository.countByStatus(TaskStatus.DONE)
        );
    }
}
