# The launch essay — founder thesis memo

> The category-wedge artifact. One text, four uses: the Show HN post body,
> newsletter issue #1, the first long-form content piece, and the canonical
> "why this exists" link from everything else. Edit tone per channel; the
> argument stays identical. The frame to make repeatable: **peer-anonymous,
> multi-round, no server.**

---

## Your meetings have a rigged voting system

Every team believes it makes decisions on the merits. Almost none do.

Watch any planning meeting, retro, or risk review closely and you can see the
actual algorithm at work: the highest-paid person's opinion sets the anchor;
whoever speaks first frames everyone after them; the confident sound correct;
the cautious self-censor; and by minute forty the group has "aligned" on
something that is really just the social gradient of the room. This isn't a
character flaw in your team. It's what human groups do under visibility. The
research on it is fifty years old and damning: groups routinely perform below
their best individual member, and the diversity a team pays so much to hire
is precisely what gets suppressed.

Here's what should bother you more: **the fix is also fifty years old.** The
Delphi method (RAND, 1950s) and the Nominal Group Technique (1970s) figured
out the recipe long ago — collect judgments *independently and anonymously to
peers*, consolidate them without attribution, feed the merged picture back,
iterate, then rank privately and aggregate. Separate the ideas from the
status of the people holding them, and the group suddenly outperforms its
loudest member. This is one of the most replicated results in group
decision research, and it's used today exactly where being wrong is
expensive: clinical consensus panels, forecasting, safety assessments.

So why doesn't your team use it? Because operationally it's miserable. Run it
by hand and you're the facilitator maintaining a spreadsheet, mail-merging
questions, de-identifying rows, and re-mailing consolidated lists for three
rounds. The academic tools that automate it are priced and shaped for
research programs, not for a Tuesday retro.

And every modern attempt to productize it made the same move: put a server in
the middle. That move quietly breaks the whole premise. The entire value of
the method is *candor* — and candor is a trust problem, not a features
problem. The moment honest answers about your team, your risks, your
leadership sit in a third-party database, three things happen: your most
careful people (the ones whose candor you most need) hedge again; your IT
department gets a veto; and the anonymity claim becomes something you have to
*believe* rather than something you can *verify*.

**What we understood before the market: the server was never necessary.**

Browsers have had real cryptography built in for a decade. Synergon runs the
entire loop — pose a question, collect peer-anonymous answers, deduplicate
and consolidate, send back for clarification, rank, aggregate — as a static
web page. There is no backend. There are no accounts. Each participant gets a
link whose payload is an end-to-end encrypted envelope, and a password that
travels separately; answers come back the same way. The coordinator's data
lives in their own browser. Anonymity between colleagues isn't a policy we
promise — it's enforced by the type system and the crypto, and you can read
both, because all of it is open source.

Two honest boundaries, because overclaiming is how tools like this die.
First: answers are anonymous *to other participants* — the coordinator who
sent the invitations knows who received each link. That's the boundary that
kills the social distortion, and it's the one we can actually guarantee.
Second: with no server, *you* carry the envelopes — copy a link out, paste a
response back. That friction is a choice. It's also the honest price of
"nothing to trust but math," and for the moments this tool exists for — the
risk review where somebody knows something they won't say out loud — it's a
price worth paying. (A hosted relay that only ever sees ciphertext will exist
for teams who'd rather pay than paste. The local product stays complete, and
free, forever.)

The spreadsheet is our real competitor, not the polling apps. Polling apps do
one visible round and leave the social gradient intact. The spreadsheet at
least runs the real method — it just costs the facilitator an afternoon per
round. Synergon is that afternoon, in about ten minutes, with cryptographic
anonymity the spreadsheet never had.

Fifty years of evidence, zero servers, free. Try the built-in demo — it's a
finished three-round deliberation, from raw risk list to ranked shortlist,
and it takes two minutes to read: https://cjander18.github.io/synergon/

---

*Channel notes — HN: keep the title architecture-forward ("…runs entirely in
the browser; E2E-encrypted envelopes in the URL fragment"), post this text
trimmed ~20%, link security-model.md in the first comment. Newsletter #1:
as-is plus a personal opening line. Long-form: as-is with the bias glossary
linked. Never edit the two honest boundaries out — they are the credibility.*
