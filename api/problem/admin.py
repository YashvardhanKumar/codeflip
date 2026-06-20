from django.contrib import admin
from .models import (
    Problem,
    Codeblock,
    Testcase,
    Solution,
    Tags,
    ProblemTags,
    Discuss,
    DiscussTags,
    Variable,
    Method,
)
from .utils import generate_codeblocks_for_problem


class CodeblockInline(admin.TabularInline):
    model = Codeblock
    extra = 1
    fields = ("language", "block", "runner_code")


from .models import CustomType, CustomTypeLanguage


class CustomTypeLanguageInline(admin.TabularInline):
    model = CustomTypeLanguage
    extra = 1


@admin.register(CustomType)
class CustomTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
    inlines = [CustomTypeLanguageInline]

    class Media:
        js = ("admin/js/codeblock_updater.js", "admin/js/cm6_loader.js")


class ProblemTagsInline(admin.TabularInline):
    model = ProblemTags
    extra = 1


from .admin_views import TypeSelectForm


class MethodInline(admin.TabularInline):
    model = Method
    extra = 1
    form = TypeSelectForm


class VariableInline(admin.TabularInline):
    model = Variable
    extra = 1
    form = TypeSelectForm

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "method":
            if request.resolver_match and request.resolver_match.kwargs.get(
                "object_id"
            ):
                object_id = request.resolver_match.kwargs.get("object_id")
                kwargs["queryset"] = Method.objects.filter(problem_id=object_id)
            else:
                kwargs["queryset"] = Method.objects.none()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.action(description="Generate Codeblocks from Variables")
def generate_codeblocks_action(modeladmin, request, queryset):
    for problem in queryset:
        generate_codeblocks_for_problem(problem, force=True)
    modeladmin.message_user(
        request, "Codeblocks successfully generated for selected problems."
    )


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "get_editorial_discussion", "created_at")
    list_filter = ("created_at",)
    search_fields = ("id", "name", "problem_description")
    readonly_fields = (
        "id",
        "created_at",
        "get_editorial_discussion",
        "manage_testcases_link",
    )
    inlines = [MethodInline, VariableInline, CodeblockInline, ProblemTagsInline]
    actions = [generate_codeblocks_action]

    class Media:
        js = ("admin/js/codeblock_updater.js", "admin/js/cm6_loader.js")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "id",
                    "name",
                    "problem_description",
                    "get_editorial_discussion",
                    "manage_testcases_link",
                )
            },
        ),
        ("Metadata", {"fields": ("created_at",)}),
    )

    def manage_testcases_link(self, obj):
        if obj.id:
            from django.utils.html import format_html
            from django.urls import reverse

            url = (
                reverse("admin:problem_testcase_changelist")
                + f"?problem__id__exact={obj.id}"
            )
            count = obj.testcases.count()
            return format_html(
                '<a href="{}" class="button" target="_blank" style="background-color: #27ae60; color: white; padding: 5px 12px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;">Manage {} Test Cases ➔</a>',
                url,
                count,
            )
        return "Save the problem first to add test cases."

    manage_testcases_link.short_description = "Test Cases"

    def get_editorial_discussion(self, obj):
        editorial = obj.discussions.filter(is_editorial=True).first()
        if editorial:
            from django.utils.html import format_html
            from django.urls import reverse

            url = reverse("admin:problem_discuss_change", args=[editorial.id])
            return format_html('<a href="{}">Discussion #{}</a>', url, editorial.id)
        return "None"

    get_editorial_discussion.short_description = "Editorial Discussion"

    def get_description_preview(self, obj):
        return (
            obj.problem_description[:100] + "..."
            if len(obj.problem_description) > 100
            else obj.problem_description
        )

    get_description_preview.short_description = "Description"

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        # Check if variables were updated and generate codeblocks automatically
        for formset in formsets:
            if formset.model == Variable and formset.has_changed():
                generate_codeblocks_for_problem(form.instance, force=True)
                break
        else:
            # Also generate if we are just creating the problem and variables are present
            if not change:
                generate_codeblocks_for_problem(form.instance, force=True)


@admin.register(Codeblock)
class CodeblockAdmin(admin.ModelAdmin):
    list_display = ("id", "problem", "language", "get_block_preview")
    list_filter = ("problem", "language")
    search_fields = ("problem__id", "block", "runner_code")
    readonly_fields = ("id",)
    raw_id_fields = ("problem",)

    def get_block_preview(self, obj):
        return obj.block[:100] + "..." if len(obj.block) > 100 else obj.block

    get_block_preview.short_description = "Code Block"


@admin.register(Testcase)
class TestcaseAdmin(admin.ModelAdmin):
    list_display = ("id", "problem", "created_at")
    list_filter = ("created_at", "problem")
    search_fields = ("problem__id", "input", "output", "display_testcase")
    readonly_fields = ("id", "created_at")
    raw_id_fields = ("problem",)

    fieldsets = (
        (None, {"fields": ("id", "problem", "input", "output", "display_testcase")}),
        ("Metadata", {"fields": ("created_at",)}),
    )


@admin.register(Solution)
class SolutionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "problem", "language", "status", "created_at")
    list_filter = ("status", "language", "created_at", "problem")
    search_fields = ("user__username", "problem__id")
    readonly_fields = ("id", "created_at", "status")
    raw_id_fields = ("user", "problem")

    fieldsets = (
        (None, {"fields": ("id", "user", "problem", "code", "language")}),
        ("Status", {"fields": ("status",)}),
        ("Metadata", {"fields": ("created_at",)}),
    )

    def get_readonly_fields(self, request, obj=None):
        # Make status readonly only for existing objects (after submission)
        if obj:
            return self.readonly_fields
        return ("id", "created_at")


@admin.register(Tags)
class TagsAdmin(admin.ModelAdmin):
    list_display = ("id", "tags")
    search_fields = ("tags",)
    readonly_fields = ("id",)


@admin.register(ProblemTags)
class ProblemTagsAdmin(admin.ModelAdmin):
    list_display = ("problem", "tag")
    list_filter = ("tag",)
    search_fields = ("problem__id", "tag__tags")
    raw_id_fields = ("problem", "tag")


class DiscussTagsInline(admin.TabularInline):
    model = DiscussTags
    extra = 1


@admin.register(Discuss)
class DiscussAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "problem", "is_editorial", "created_at")
    list_filter = ("is_editorial", "created_at", "problem")
    search_fields = ("title", "body", "author__username")
    readonly_fields = ("id", "created_at")
    raw_id_fields = ("author", "problem", "user")
    inlines = [DiscussTagsInline]

    fieldsets = (
        (None, {"fields": ("id", "title", "body", "is_editorial")}),
        ("Relations", {"fields": ("author", "user", "problem")}),
        ("Metadata", {"fields": ("created_at",)}),
    )

    def get_readonly_fields(self, request, obj=None):
        readonly = list(self.readonly_fields)
        if obj:
            if not request.user.is_staff and not request.user.is_superuser:
                readonly.append("is_editorial")
        return tuple(readonly)


@admin.register(DiscussTags)
class DiscussTagsAdmin(admin.ModelAdmin):
    list_display = ("discuss", "tag")
    list_filter = ("tag",)
    search_fields = ("discuss__title", "tag__tags")
    raw_id_fields = ("discuss", "tag")
