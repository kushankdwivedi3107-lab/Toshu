from core.analysis_basic import analyse_text_basic
from core.pdf_reader import extract_text_from_pdf
from core.grammar_checker import check_text, format_issues_for_console
from core.reporting import save_report
from core.similarity import compare_texts
from config.settings import APP_NAME, APP_TAGLINE
import os


def analyse_demo_text() -> str:
    text = (
        "This is Toshu, a research writing assistant designed to work offline. "
        "Soon it will handle PDF search, grammar checks, citations, and plagiarism detection."
    )
    stats = analyse_text_basic(text)

    lines = []
    lines.append(f"{APP_NAME} – {APP_TAGLINE}")
    lines.append("-" * 60)
    lines.append("\nBasic Text Analysis Result (demo text):")
    for key, value in stats.items():
        lines.append(f"  {key}: {value}")
    return "\n".join(lines)


def analyse_pdf() -> str:
    sample_path = os.path.join("pdf_library", "sample.pdf")
    lines = []

    if not os.path.exists(sample_path):
        lines.append("⚠ No sample.pdf found in pdf_library — add a PDF named sample.pdf to test.")
        return "\n".join(lines)

    lines.append("Reading PDF...")
    text = extract_text_from_pdf(sample_path)
    lines.append("\nPDF Loaded Successfully! Showing first 300 characters:\n")
    lines.append(text[:300] + " ...")
    return "\n".join(lines)


def analyse_sample_grammar() -> str:
    text = (
        "Although tourism sectors have expanded significantly over the past decade, "
        "there remain considerable gaps in understanding how destination branding shapes "
        "visitor perceptions and sustainable behaviour. Several researchers argues that "
        "branding strategies influence travel decision-making, but empirical validation "
        "is limited across diverse cultural and socio-economic context."
    )
    issues = check_text(text)
    formatted = format_issues_for_console(issues)

    header = "Running grammar check on sample research-style paragraph...\n"
    return header + formatted


def analyse_user_text() -> str:
    print("\n=== Custom Text Analysis Mode ===")
    print("Paste one academic paragraph (single line) and press ENTER.")
    user_text = input("\nYour text:\n")

    if not user_text.strip():
        return "No text entered. Skipping custom analysis."

    # Basic stats
    stats = analyse_text_basic(user_text)
    lines = []
    lines.append("Basic Text Analysis (your text):")
    for key, value in stats.items():
        lines.append(f"  {key}: {value}")

    # Grammar/style issues
    lines.append("\nGrammar and Style Feedback (your text):\n")
    issues = check_text(user_text)
    lines.append(format_issues_for_console(issues))

    return "\n".join(lines)


def compare_two_texts_interactive() -> str:
    """
    Simple local similarity checker between two texts.
    """
    print("\n=== Similarity Check Between Two Texts ===")
    print("Paste Text A (e.g. your paragraph) and press ENTER.")
    text_a = input("\nText A:\n")

    print("\nPaste Text B (e.g. another paragraph/source) and press ENTER.")
    text_b = input("\nText B:\n")

    if not text_a.strip() or not text_b.strip():
        return "One or both texts were empty; cannot compare."

    scores = compare_texts(text_a, text_b)

    lines = []
    lines.append("Similarity between Text A and Text B:")
    lines.append(f"  Jaccard (unique word overlap)   : {scores['jaccard_%']:.2f}%")
    lines.append(f"  Cosine (frequency similarity)  : {scores['cosine_%']:.2f}%")
    lines.append(f"  Vocab overlap (smaller vocab)  : {scores['vocab_overlap_%']:.2f}%")

    return "\n".join(lines)


def main_menu():
    while True:
        print("\n" + "=" * 60)
        print(f"{APP_NAME} – {APP_TAGLINE}")
        print("=" * 60)
        print("Choose an option:")
        print("  1) Analyse built-in demo text")
        print("  2) Analyse sample.pdf in pdf_library")
        print("  3) Grammar check on sample research paragraph")
        print("  4) Analyse *your* academic paragraph")
        print("  5) Compare two texts (similarity check)")
        print("  6) Exit")
        choice = input("\nEnter choice (1–6): ").strip()

        if choice == "1":
            result = analyse_demo_text()
            print("\n" + result)
            maybe_save(result, "demo")

        elif choice == "2":
            result = analyse_pdf()
            print("\n" + result)
            maybe_save(result, "pdf")

        elif choice == "3":
            result = analyse_sample_grammar()
            print("\n" + result)
            maybe_save(result, "grammar_sample")

        elif choice == "4":
            result = analyse_user_text()
            print("\n" + result)
            maybe_save(result, "user_text")

        elif choice == "5":
            result = compare_two_texts_interactive()
            print("\n" + result)
            maybe_save(result, "similarity")

        elif choice == "6":
            print("\nExiting Toshu. Goodbye.")
            break

        else:
            print("Invalid choice. Please enter a number from 1 to 6.")


def maybe_save(content: str, prefix: str):
    """
    Ask whether to save this analysis into logs as a report.
    """
    answer = input("\nSave this result to a report file? (y/n): ").strip().lower()
    if answer == "y":
        path = save_report(content + "\n", prefix=prefix)
        print(f"Report saved to: {path}")
    else:
        print("Report not saved.")


if __name__ == "__main__":
    main_menu()
