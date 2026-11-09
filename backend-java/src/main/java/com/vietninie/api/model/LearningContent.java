package com.vietninie.api.model;

import com.vietninie.api.enums.*;
import jakarta.persistence.*;

@Entity
@Table(
    name = "learning_content",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_content_key",
            columnNames = {"content_type", "language", "source_id"}))
public class LearningContent {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(name = "content_type", nullable = false, length = 30)
  private ContentType contentType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 5)
  private LearningLanguage language;

  @Column(name = "source_id", nullable = false, length = 100)
  private String sourceId;

  @Column(nullable = false, length = 500)
  private String title;

  @Column(length = 50)
  private String level;

  @Column(length = 200)
  private String topic;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String payload;

  @Version private long version;

  public Long getId() {
    return id;
  }

  public ContentType getContentType() {
    return contentType;
  }

  public void setContentType(ContentType v) {
    contentType = v;
  }

  public LearningLanguage getLanguage() {
    return language;
  }

  public void setLanguage(LearningLanguage v) {
    language = v;
  }

  public String getSourceId() {
    return sourceId;
  }

  public void setSourceId(String v) {
    sourceId = v;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String v) {
    title = v;
  }

  public String getLevel() {
    return level;
  }

  public void setLevel(String v) {
    level = v;
  }

  public String getTopic() {
    return topic;
  }

  public void setTopic(String v) {
    topic = v;
  }

  public String getPayload() {
    return payload;
  }

  public void setPayload(String v) {
    payload = v;
  }
}
