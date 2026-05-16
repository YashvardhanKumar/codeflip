from django.db import models
from django.conf import settings
from user.models import CodingLanguage  # Import from user app
from ckeditor.fields import RichTextField


class AnswerStatus(models.TextChoices):
    QUEUE = "QUEUE", "In Queue"
    PROCESSING = "PROCESSING", "Processing"
    ACCEPTED = "Accepted", "Accepted"
    WRONG_ANSWER = "Wrong Answer", "Wrong Answer"
    TIME_LIMIT_EXCEEDED = "Time Limit Exceeded", "Time Limit Exceeded"
    COMPILATION_ERROR = "Compilation Error", "Compilation Error"
    RUNTIME_ERROR_SIGSEGV = "Runtime Error (SIGSEGV)", "Runtime Error (SIGSEGV)"
    RUNTIME_ERROR_SIGXFSZ = "Runtime Error (SIGXFSZ)", "Runtime Error (SIGXFSZ)"
    RUNTIME_ERROR_SIGFPE = "Runtime Error (SIGFPE)", "Runtime Error (SIGFPE)"
    RUNTIME_ERROR_SIGABRT = "Runtime Error (SIGABRT)", "Runtime Error (SIGABRT)"
    RUNTIME_ERROR_NZEC = "Runtime Error (NZEC)", "Runtime Error (NZEC)"
    RUNTIME_ERROR_OTHER = "Runtime Error (Other)", "Runtime Error (Other)"
    INTERNAL_ERROR = "Internal Error", "Internal Error"
    EXEC_FORMAT_ERROR = "Exec Format Error", "Exec Format Error"
    INVALID_TESTCASE = "Invalid Testcase", "Invalid Testcase"


class Difficulty(models.TextChoices):
    EASY = "EASY", "Easy"
    MEDIUM = "MEDIUM", "Medium"
    HARD = "HARD", "Hard"


class DataType(models.TextChoices):
    STRING = "string"
    INTEGER = "integer"


class Tags(models.Model):
    id = models.BigAutoField(primary_key=True)
    tags = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = "tags"
        verbose_name = "Tag"
        verbose_name_plural = "Tags"

    def __str__(self):
        return self.tags


class Problem(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(
        max_length=255, null=False, default="", help_text="Title of the problem"
    )
    problem_description = RichTextField(blank=True, null=False)
    tags = models.ManyToManyField(Tags, through="ProblemTags", related_name="problems")
    difficulty = models.CharField(
        max_length=10, choices=Difficulty.choices, default=Difficulty.EASY
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "problem"
        verbose_name = "Problem"
        verbose_name_plural = "Problems"
        ordering = ["id"]

    def __str__(self):
        return self.name


class Codeblock(models.Model):
    id = models.BigAutoField(primary_key=True)
    problem = models.ForeignKey(
        Problem, on_delete=models.CASCADE, related_name="codeblocks"
    )
    imports = models.TextField(blank=True, null=False)
    block = models.TextField(blank=True, null=False)
    runner_code = models.TextField(blank=True, null=False)
    language = models.CharField(
        max_length=20,
        choices=CodingLanguage.choices,
        default=CodingLanguage.PYTHON,
        verbose_name="Programming Language",
    )

    class Meta:
        db_table = "codeblock"
        verbose_name = "Code Block"
        verbose_name_plural = "Code Blocks"
        unique_together = ("problem", "language")

    def __str__(self):
        return (
            f"Codeblock for Problem #{self.problem.id} ({self.get_language_display()})"
        )


class Testcase(models.Model):
    id = models.BigAutoField(primary_key=True)
    problem = models.ForeignKey(
        Problem, on_delete=models.CASCADE, related_name="testcases"
    )
    input = models.TextField(blank=True, null=False)
    output = models.TextField(blank=True, null=False)
    output_type = models.CharField(
        max_length=10,
        choices=DataType.choices,
        default=DataType.INTEGER,
        verbose_name="Output Data Type",
    )
    display_testcase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "testcase"
        verbose_name = "Test Case"
        verbose_name_plural = "Test Cases"
        ordering = ["created_at"]

    def __str__(self):
        return f"Testcase #{self.id} for Problem #{self.problem.id}"


class Solution(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="solutions"
    )
    problem = models.ForeignKey(
        Problem, on_delete=models.CASCADE, related_name="solutions"
    )
    code = models.TextField()
    language = models.CharField(
        max_length=20,
        choices=CodingLanguage.choices,
        default=CodingLanguage.PYTHON,
        verbose_name="Programming Language",
    )
    status = models.CharField(
        max_length=30, choices=AnswerStatus.choices, blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "solution"
        verbose_name = "Solution"
        verbose_name_plural = "Solutions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Solution by {self.user.username} for Problem #{self.problem.id} ({self.get_language_display()})"


class ProblemTags(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tags, on_delete=models.CASCADE)

    class Meta:
        db_table = "problem_tags"
        unique_together = ("problem", "tag")
        verbose_name = "Problem Tag"
        verbose_name_plural = "Problem Tags"

    def __str__(self):
        return f"{self.problem} - {self.tag}"


class Discuss(models.Model):
    id = models.BigAutoField(primary_key=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="discussions_authored",
        db_column="author_id",
    )
    problem = models.ForeignKey(
        Problem, on_delete=models.CASCADE, related_name="discussions"
    )
    title = models.CharField(max_length=255)
    body = RichTextField(blank=True, null=False, help_text="Content of the post")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="discussions",
        help_text="User associated with this discussion",
    )
    tags = models.ManyToManyField(
        Tags, through="DiscussTags", related_name="discussions"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "discuss"
        verbose_name = "Discussion"
        verbose_name_plural = "Discussions"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class DiscussTags(models.Model):
    discuss = models.ForeignKey(Discuss, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tags, on_delete=models.CASCADE)

    class Meta:
        db_table = "discuss_tags"
        unique_together = ("discuss", "tag")
        verbose_name = "Discussion Tag"
        verbose_name_plural = "Discussion Tags"

    def __str__(self):
        return f"{self.discuss} - {self.tag}"
