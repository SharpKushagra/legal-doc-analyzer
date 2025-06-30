def highlight_keywords(summary):
    # Words to emphasize
    highlights = ["Appellant", "Respondent", "Court", "Judgment", "Verdict"]
    for word in highlights:
        summary = summary.replace(word, f"**:orange[{word}]**")
    return summary
