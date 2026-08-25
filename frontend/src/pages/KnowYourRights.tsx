import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, HelpCircle, PhoneCall, ArrowRight } from 'lucide-react';

const KnowYourRights = () => {
  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">

          <div className="mb-12">
            <Link to="/legal-resources" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] mb-8 transition-colors font-sans">
              <ArrowLeft className="w-4 h-4" /> Back to all resources
            </Link>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 leading-tight">Know Your Rights</h1>
            <p className="font-sans text-xl text-gray-300 max-w-3xl">A comprehensive handbook on the fundamental rights and civic duties of citizens of India — what the Constitution guarantees you, and how to enforce it.</p>
          </div>

          <div className="bg-[#D4AF37]/10 border-l-4 border-[#D4AF37] p-6 rounded-r-xl mb-12 flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-[#D4AF37] shrink-0" />
            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Educational Information Only</h3>
              <p className="font-sans text-gray-300">This handbook summarises the Constitution of India and related laws for general education. It is <span className="text-white font-semibold">not legal advice</span>. Laws change, and every situation is different — always consult a qualified advocate for your specific matter.</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 relative">

            {/* Table of Contents */}
            <aside className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-32 glass-card p-6 rounded-2xl border border-white/10">
                <h4 className="font-serif font-bold text-lg mb-4 text-[#D4AF37]">Table of Contents</h4>
                <ul className="space-y-3 font-sans text-sm text-gray-400">
                  <li><a href="#introduction" className="hover:text-white transition-colors">1. Introduction</a></li>
                  <li><a href="#overview" className="hover:text-white transition-colors">2. The Fundamental Rights</a></li>
                  <li><a href="#equality" className="hover:text-white transition-colors">3. Right to Equality</a></li>
                  <li><a href="#freedom" className="hover:text-white transition-colors">4. Right to Freedom</a></li>
                  <li><a href="#exploitation" className="hover:text-white transition-colors">5. Against Exploitation</a></li>
                  <li><a href="#religion" className="hover:text-white transition-colors">6. Freedom of Religion</a></li>
                  <li><a href="#cultural" className="hover:text-white transition-colors">7. Cultural &amp; Educational</a></li>
                  <li><a href="#remedies" className="hover:text-white transition-colors">8. Right to Remedies</a></li>
                  <li><a href="#duties" className="hover:text-white transition-colors">9. Fundamental Duties</a></li>
                  <li><a href="#directive-principles" className="hover:text-white transition-colors">10. Directive Principles</a></li>
                  <li><a href="#related-rights" className="hover:text-white transition-colors">11. RTI &amp; Privacy</a></li>
                  <li><a href="#help" className="hover:text-white transition-colors">12. Where to Get Help</a></li>
                  <li><a href="#practical" className="hover:text-white transition-colors">13. Rights in Practice</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">14. Frequently Asked Questions</a></li>
                </ul>
              </div>
            </aside>

            {/* Article */}
            <article className="lg:w-3/4 font-sans text-gray-300 leading-relaxed space-y-12">

              {/* 1. Introduction */}
              <section id="introduction" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">1. Introduction — The Constitution and You</h2>
                <p>The Constitution of India, which came into force on <span className="text-white font-semibold">26 January 1950</span>, is the supreme law of the land. It is a living document that guarantees certain rights to every person, and expects every citizen to perform certain duties. No law, order, or government action can override the rights the Constitution protects.</p>
                <p className="mt-4">The <span className="text-white font-semibold">Preamble</span> declares India a sovereign, socialist, secular, democratic republic and promises its people:</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" /><span><span className="text-white font-semibold">Justice</span> — social, economic and political</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" /><span><span className="text-white font-semibold">Liberty</span> — of thought, expression, belief, faith and worship</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" /><span><span className="text-white font-semibold">Equality</span> — of status and of opportunity</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" /><span><span className="text-white font-semibold">Fraternity</span> — assuring the dignity of the individual and the unity and integrity of the Nation</span></li>
                </ul>
                <p className="mt-4">This guide walks you through <span className="text-white font-semibold">Part III (Fundamental Rights, Articles 12–35)</span>, <span className="text-white font-semibold">Part IV (Directive Principles, Articles 36–51)</span>, and <span className="text-white font-semibold">Part IVA (Fundamental Duties, Article 51A)</span> — and tells you what to do when a right is threatened.</p>
              </section>

              {/* 2. Overview */}
              <section id="overview" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">2. The Fundamental Rights — An Overview</h2>
                <p>Fundamental Rights are the basic human freedoms guaranteed by the Constitution to all persons (and, in some cases, only to citizens). They protect the individual against arbitrary state action and, in certain situations, against the actions of private individuals.</p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { t: 'Right to Equality', d: 'Articles 14–18 — equal protection of law, no discrimination, equality of opportunity.' },
                    { t: 'Right to Freedom', d: 'Articles 19–22 — speech, assembly, movement, life and personal liberty, protection on arrest.' },
                    { t: 'Right against Exploitation', d: 'Articles 23–24 — no forced labour, no child labour in hazardous work.' },
                    { t: 'Freedom of Religion', d: 'Articles 25–28 — freedom of conscience and religious practice.' },
                    { t: 'Cultural & Educational Rights', d: 'Articles 29–30 — protection of minorities and their institutions.' },
                    { t: 'Right to Constitutional Remedies', d: 'Article 32 — the right to approach courts to enforce all of the above.' },
                  ].map(item => (
                    <div key={item.t} className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <h3 className="font-serif text-lg font-bold text-[#D4AF37] mb-1">{item.t}</h3>
                      <p className="text-sm text-gray-400">{item.d}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6">Fundamental Rights are not absolute — the Constitution allows the State to impose <span className="text-white font-semibold">reasonable restrictions</span> in the interest of public order, security, morality, and similar grounds. During a formally declared <span className="text-white font-semibold">National Emergency</span>, certain rights may be suspended. Article 20 and Article 21, however, remain protected even during an emergency.</p>
              </section>

              {/* 3. Right to Equality */}
              <section id="equality" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">3. Right to Equality (Articles 14–18)</h2>
                <ul className="space-y-4">
                  <li><span className="text-white font-semibold">Article 14 — Equality before law:</span> The State shall not deny to any person equality before the law or the equal protection of the laws. Everyone is equal in the eyes of the law.</li>
                  <li><span className="text-white font-semibold">Article 15 — No discrimination:</span> The State shall not discriminate against any citizen on grounds only of religion, race, caste, sex, or place of birth. The State may, however, make special provisions for women and children, and for the advancement of socially and educationally backward classes, SCs and STs.</li>
                  <li><span className="text-white font-semibold">Article 16 — Equality of opportunity in public employment:</span> Every citizen has equal opportunity in matters of public employment. Reservations for backward classes are permitted.</li>
                  <li><span className="text-white font-semibold">Article 17 — Abolition of Untouchability:</span> Untouchability is abolished and its practice in any form is a punishable offence.</li>
                  <li><span className="text-white font-semibold">Article 18 — Abolition of titles:</span> The State cannot confer titles (except military and academic distinctions). Citizens cannot accept titles from foreign States.</li>
                </ul>
              </section>

              {/* 4. Right to Freedom */}
              <section id="freedom" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">4. Right to Freedom (Articles 19–22)</h2>
                <p><span className="text-white font-semibold">Article 19</span> protects six freedoms of citizens, subject to reasonable restrictions:</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Freedom of speech and expression</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Freedom to assemble peaceably and without arms</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Freedom to form associations and unions</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Freedom to move freely throughout India</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Freedom to reside and settle in any part of India</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Freedom to practise any profession, or to carry on any occupation, trade or business</li>
                </ul>
                <p className="mt-4"><span className="text-white font-semibold">Article 20</span> protects persons against conviction except in accordance with law: no <em>ex post facto</em> punishment, no double jeopardy for the same offence, and no compulsion to be a witness against oneself.</p>
                <p className="mt-4"><span className="text-white font-semibold">Article 21 — Life and personal liberty:</span> "No person shall be deprived of his life or personal liberty except according to procedure established by law." Through the famous <span className="text-white font-semibold">Maneka Gandhi</span> judgment (1978), the Supreme Court held that this procedure must be fair, just and reasonable — effectively giving everyone a broad due-process protection. Over time, Article 21 has been interpreted to include the right to a clean environment, health, food, shelter, education, speedy trial, and the right to privacy.</p>
                <p className="mt-4"><span className="text-white font-semibold">Article 21A — Right to education:</span> The State shall provide free and compulsory education to all children aged 6 to 14 years (added by the 86th Amendment, 2002).</p>
                <p className="mt-4"><span className="text-white font-semibold">Article 22 — Protection against arrest and detention:</span> Anyone arrested must be informed of the grounds of arrest, must have the right to consult a lawyer, and must be produced before a magistrate within <span className="text-white font-semibold">24 hours</span>. Preventive detention is permitted only under specified laws with safeguards.</p>
              </section>

              {/* 5. Right against Exploitation */}
              <section id="exploitation" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">5. Right against Exploitation (Articles 23–24)</h2>
                <ul className="space-y-4">
                  <li><span className="text-white font-semibold">Article 23 — No forced labour:</span> Traffic in human beings and forced labour (begar) are prohibited. Bonded labour is illegal, and any form of forced work is a punishable offence.</li>
                  <li><span className="text-white font-semibold">Article 24 — No child labour in hazardous work:</span> No child below the age of 14 years may be employed in a factory, mine, or any other hazardous employment. The Child Labour (Prohibition and Regulation) Act further regulates child employment.</li>
                </ul>
              </section>

              {/* 6. Freedom of Religion */}
              <section id="religion" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">6. Right to Freedom of Religion (Articles 25–28)</h2>
                <ul className="space-y-4">
                  <li><span className="text-white font-semibold">Article 25 — Freedom of conscience and religion:</span> All persons are equally entitled to freedom of conscience and the right to freely profess, practise and propagate religion, subject to public order, morality and health.</li>
                  <li><span className="text-white font-semibold">Article 26 — Manage religious affairs:</span> Every religious denomination may establish and maintain institutions for religious and charitable purposes, and manage its own affairs in matters of religion.</li>
                  <li><span className="text-white font-semibold">Article 27 — No compulsory taxes for religion:</span> No person may be compelled to pay any tax for the promotion or maintenance of any particular religion.</li>
                  <li><span className="text-white font-semibold">Article 28 — No religious instruction in State institutions:</span> Institutions wholly maintained by the State cannot impart religious instruction. Education imparted in State-recognised institutions cannot be attended compulsorily by anyone who objects.</li>
                </ul>
              </section>

              {/* 7. Cultural & Educational Rights */}
              <section id="cultural" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">7. Cultural and Educational Rights (Articles 29–30)</h2>
                <ul className="space-y-4">
                  <li><span className="text-white font-semibold">Article 29 — Protection of interests of minorities:</span> Any section of citizens with a distinct language, script or culture has the right to conserve it. No citizen can be denied admission to a State-run or State-aided educational institution on grounds only of religion, race, caste, or language.</li>
                  <li><span className="text-white font-semibold">Article 30 — Right of minorities to run institutions:</span> Minorities, whether based on religion or language, have the right to establish and administer their own educational institutions.</li>
                </ul>
              </section>

              {/* 8. Right to Remedies */}
              <section id="remedies" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">8. Right to Constitutional Remedies (Article 32)</h2>
                <p>Dr. B.R. Ambedkar called Article 32 the <span className="text-white font-semibold">"heart and soul"</span> of the Constitution. It gives every person the right to move the Supreme Court directly to enforce their Fundamental Rights. The Supreme Court can issue five kinds of writs:</p>
                <div className="mt-6 space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4"><span className="text-white font-semibold">Habeas Corpus</span> — "produce the body": orders that a person who has been detained be brought before the court, so it can examine whether the detention is lawful.</div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4"><span className="text-white font-semibold">Mandamus</span> — "we command": orders a public official or authority to perform a duty they are legally bound to perform.</div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4"><span className="text-white font-semibold">Prohibition</span> — restrains a lower court or tribunal from proceeding beyond its jurisdiction.</div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4"><span className="text-white font-semibold">Certiorari</span> — "to be certified": quashes an order already passed by a lower court or tribunal, usually for error of law or lack of jurisdiction.</div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4"><span className="text-white font-semibold">Quo Warranto</span> — "by what authority": questions whether a person legally holds a public office.</div>
                </div>
                <p className="mt-6">The High Courts can also issue these writs under <span className="text-white font-semibold">Article 226</span> — and for most citizens, approaching the High Court first is the practical starting point. Since 2015, the Supreme Court accepts petitions even in simple language; you are not required to have a lawyer, but for complex matters it is strongly advisable to engage one.</p>
              </section>

              {/* 9. Fundamental Duties */}
              <section id="duties" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">9. Fundamental Duties (Article 51A)</h2>
                <p>Fundamental Duties were added to the Constitution by the <span className="text-white font-semibold">42nd Amendment (1976)</span>, based on the recommendation of the Swaran Singh Committee. An eleventh duty was added by the <span className="text-white font-semibold">86th Amendment (2002)</span>. They are not directly enforceable in court, but they remind every citizen of their obligations to the nation:</p>
                <ol className="mt-4 space-y-3 list-none">
                  {[
                    'To abide by the Constitution and respect its ideals and institutions, the National Flag and the National Anthem.',
                    'To cherish and follow the noble ideals which inspired our national struggle for freedom.',
                    'To uphold and protect the sovereignty, unity and integrity of India.',
                    'To defend the country and render national service when called upon to do so.',
                    'To promote harmony and the spirit of common brotherhood amongst all the people, transcending religious, linguistic and regional diversities, and to renounce practices derogatory to the dignity of women.',
                    'To value and preserve the rich heritage of our composite culture.',
                    'To protect and improve the natural environment including forests, lakes, rivers and wildlife, and to have compassion for living creatures.',
                    'To develop the scientific temper, humanism and the spirit of inquiry and reform.',
                    'To safeguard public property and to abjure violence.',
                    'To strive towards excellence in all spheres of individual and collective activity.',
                    'To provide opportunities for education to one\'s child or ward between the ages of six and fourteen years.',
                  ].map((duty, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-8 h-8 shrink-0 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{i + 1}</span>
                      <span className="pt-1">{duty}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* 10. Directive Principles */}
              <section id="directive-principles" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">10. Directive Principles of State Policy (Part IV, Articles 36–51)</h2>
                <p>Directive Principles are the <span className="text-white font-semibold">goals and ideals</span> that the State must keep in mind while making laws and policies. They are <span className="text-white font-semibold">not enforceable</span> by any court, but they are "fundamental in the governance of the country". Key principles include:</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Social order promoting the welfare of the people (Article 38)</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Adequate means of livelihood, equal pay for equal work, and humane working conditions (Article 39)</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Free legal aid to ensure justice is not denied to the poor (Article 39A)</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Organisation of village panchayats as units of self-government (Article 40)</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Right to work, education and public assistance in cases of unemployment, old age, sickness and disability (Article 41)</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Uniform Civil Code for all citizens (Article 44)</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Promotion of the educational and economic interests of SCs, STs and weaker sections (Article 46)</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Protection and improvement of the environment and safeguarding of forests and wildlife (Article 48A)</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Separation of the judiciary from the executive (Article 50)</li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />Promotion of international peace and security (Article 51)</li>
                </ul>
                <p className="mt-4">While the Directive Principles guide the State, the courts have often read them together with Fundamental Rights — for example, free legal aid and a clean environment have both been recognised as flowing from Article 21.</p>
              </section>

              {/* 11. RTI & Privacy */}
              <section id="related-rights" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">11. RTI, Privacy and Other Statutory Rights</h2>
                <ul className="space-y-4">
                  <li><span className="text-white font-semibold">Right to Information (RTI Act, 2005):</span> Any citizen can seek information from any public authority. You can file an application (usually for a small fee), and the Public Information Officer (PIO) must respond within <span className="text-white font-semibold">30 days</span> (48 hours for matters involving life or liberty). A first appeal and a second appeal to the State/Central Information Commission follow if you are denied.</li>
                  <li><span className="text-white font-semibold">Right to Privacy:</span> In <span className="text-white font-semibold">Justice K.S. Puttaswamy v. Union of India (2017)</span>, a nine-judge bench of the Supreme Court declared privacy a fundamental right, integral to Article 21 and Part III generally. This is the foundation for data-protection laws like the Digital Personal Data Protection Act, 2023.</li>
                  <li><span className="text-white font-semibold">Right to legal aid:</span> Under Article 39A and the Legal Services Authorities Act, 1987, economically weaker persons are entitled to free legal aid. Each district has a District Legal Services Authority (DLSA), and NALSA coordinates at the national level.</li>
                  <li><span className="text-white font-semibold">Consumer rights:</span> The Consumer Protection Act, 2019 protects consumers against unfair trade practices and defective goods or services, with consumer commissions at district, state and national levels.</li>
                  <li><span className="text-white font-semibold">Right to property:</span> After the 44th Amendment (1978), property is no longer a Fundamental Right. It remains a constitutional legal right under Article 300A — no person shall be deprived of property save by authority of law.</li>
                </ul>
              </section>

              {/* 12. Where to Get Help */}
              <section id="help" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">12. Where to Go for Help</h2>
                <div className="mt-2 space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-serif text-lg font-bold text-[#D4AF37] mb-2 flex items-center gap-2"><PhoneCall className="w-5 h-5" /> Emergency & Police</h3>
                    <ul className="space-y-1.5 text-sm">
                      <li>Police / Emergency: <span className="text-white font-semibold">112</span></li>
                      <li>Women in distress: <span className="text-white font-semibold">181</span> (Women Helpline) / <span className="text-white font-semibold">1091</span></li>
                      <li>Child helpline: <span className="text-white font-semibold">1098</span></li>
                      <li>National Emergency (disaster, road, fire): <span className="text-white font-semibold">112</span></li>
                    </ul>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-serif text-lg font-bold text-[#D4AF37] mb-2">Courts & Tribunals</h3>
                    <ul className="space-y-1.5 text-sm">
                      <li>File a writ petition in the High Court (Article 226) or the Supreme Court (Article 32) when a Fundamental Right is violated.</li>
                      <li>Consumer Commissions for consumer disputes; Labour Courts for employment disputes; Family Courts for matrimonial matters.</li>
                      <li>Apply for bail and legal aid at the nearest district court or through the DLSA.</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-serif text-lg font-bold text-[#D4AF37] mb-2">Human Rights & Information Bodies</h3>
                    <ul className="space-y-1.5 text-sm">
                      <li>National Human Rights Commission (NHRC) — for serious violations of human rights (www.nhrc.nic.in).</li>
                      <li>State Human Rights Commissions (SHRCs) — for matters within the state.</li>
                      <li>NALSA / DLSA — free legal services (www.nalsa.gov.in).</li>
                      <li>Central/State Information Commissions — for RTI appeals.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 13. Rights in Practice */}
              <section id="practical" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">13. Your Rights in Everyday Situations</h2>
                <ul className="space-y-4">
                  <li><span className="text-white font-semibold">If you are stopped or arrested:</span> You have the right to know the reason, to remain silent, to have a lawyer present, to make a phone call, and to be produced before a magistrate within 24 hours. You must not be subjected to torture or cruel treatment.</li>
                  <li><span className="text-white font-semibold">If you face discrimination:</span> Whether in a shop, school, housing, or the workplace, you can complain to the police, the District Magistrate, or approach the High Court. Article 15 protects against discrimination based on religion, race, caste, sex or place of birth.</li>
                  <li><span className="text-white font-semibold">If your employer forces unpaid or bonded work:</span> Report it to the police or the District Magistrate. Bonded labour is a punishable offence, and former bonded labourers are entitled to rehabilitation benefits under the Bonded Labour System (Abolition) Act, 1976.</li>
                  <li><span className="text-white font-semibold">If your personal data is misused:</span> You have the right to complain under the Digital Personal Data Protection Act, 2023 to the Data Protection Board, and to approach courts where your privacy has been breached.</li>
                  <li><span className="text-white font-semibold">If you buy a defective product:</span> You can file a complaint online through the e-daakhil portal or before the District Consumer Commission. Keep the bill, warranty and correspondence.</li>
                  <li><span className="text-white font-semibold">If you believe a law is unjust:</span> A law that violates Fundamental Rights can be challenged as unconstitutional under Article 13, before a High Court or the Supreme Court.</li>
                </ul>
              </section>

              {/* 14. FAQ */}
              <section id="faq" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">14. Frequently Asked Questions</h2>
                <div className="mt-2 space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-[#D4AF37]" /> Who is protected by Fundamental Rights?</h3>
                    <p className="text-sm text-gray-400">Most Fundamental Rights protect all persons in India — citizens and non-citizens alike. A few, such as freedom of speech (Article 19) and equality of opportunity in public employment (Article 16), are available only to citizens.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-[#D4AF37]" /> Do I need a lawyer to file a writ petition?</h3>
                    <p className="text-sm text-gray-400">The Supreme Court accepts petitions in simple language without a lawyer, and legal aid is available through NALSA/DLSA if you cannot afford one. For most matters, however, an experienced advocate will substantially improve your chances.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-[#D4AF37]" /> Can Fundamental Rights be suspended?</h3>
                    <p className="text-sm text-gray-400">During a formally declared National Emergency, some rights may be suspended, but Articles 20 and 21 (protection against conviction, and life and personal liberty) remain protected.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-[#D4AF37]" /> Are Fundamental Duties enforceable in court?</h3>
                    <p className="text-sm text-gray-400">No. They are not directly enforceable, but the courts have cited them when interpreting laws — for example, the duty to protect the environment reinforces environmental laws.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-[#D4AF37]" /> What should I do first if my right is violated?</h3>
                    <p className="text-sm text-gray-400">Document everything (photos, messages, reports), lodge a police complaint where applicable, and then consult an advocate. For urgent violations such as illegal detention, approach the High Court for a writ immediately.</p>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <section className="pl-6">
                <div className="bg-gradient-to-r from-[#0a1a2e] to-[#102542] border border-[#D4AF37]/30 rounded-3xl p-8 md:p-12 text-center shadow-[0_0_40px_rgba(212,175,55,0.1)]">
                  <h2 className="font-serif text-2xl md:text-4xl font-bold mb-4">Facing a rights issue that needs expert help?</h2>
                  <p className="font-sans text-gray-300 max-w-2xl mx-auto mb-8">Connect with verified advocates who practise in your area of concern — from police complaints and detention matters to discrimination and consumer disputes.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/register/client" className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-8 py-4 rounded-xl transition-all">
                      Find a Lawyer <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/contact" className="inline-flex items-center justify-center bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-semibold px-8 py-4 rounded-xl transition-all">
                      Talk to an Advisor
                    </Link>
                  </div>
                </div>
              </section>

            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KnowYourRights;
