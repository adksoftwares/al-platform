/*
 * Copyright 2026 Vincent Tsen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.altamil.education.student

object QuizPool {
    fun getQuiz(
        subject: String,
        dayOfYear: Int,
    ): List<QuizQuestion> {
        val normalizedSubject = subject.lowercase().trim()
        val pool =
            when (normalizedSubject) {
                "biology" -> biologyPool
                "chemistry" -> chemistryPool
                "physics" -> physicsPool
                "combined maths" -> mathsPool
                else -> biologyPool
            }
        val index = dayOfYear % pool.size
        return pool[index]
    }

    private val biologyPool =
        listOf(
            listOf(
                QuizQuestion(
                    question =
                        "செல்லின் ஆற்றல் நிலையம் என்று அழைக்கப்படும் நுண்ணுறுப்பு எது" +
                            "?",
                    options =
                        listOf(
                            "உட்கரு (Nucleus)",
                            "மைட்டோகாண்ட்ரியா (Mitochondria)",
                            "ரிபோசோம் (Ribosome)",
                            "பசுங்கணிகம் (Chloroplast)",
                        ),
                    answerIndex = 1,
                    rationale =
                        "மைட்டோகாண்ட்ரியாக்கள் செல்லுக்குத் தேவையான பெரும்பாலான அடினோ" +
                            "சின் முப்பாஸ்பேட்டை (ATP) உற்பத்தி செய்கின்றன.",
                ),
                QuizQuestion(
                    question = "தாவரங்களில் ஒளிசேர்க்கை நடைபெறும் முதன்மை இடம் எது?",
                    options =
                        listOf(
                            "வேர்கள்",
                            "தண்டுகள்",
                            "இலைகள்",
                            "பூக்கள்",
                        ),
                    answerIndex = 2,
                    rationale =
                        "இலைகளில் பசுங்கணிகங்கள் அதிக அளவில் காணப்படுவதால், அவை ஒளிச்" +
                            "சேர்க்கையின் முதன்மை இடமாக விளங்குகின்றன.",
                ),
                QuizQuestion(
                    question =
                        "அனைத்து உயிரினங்களிலும் பரம்பரை தகவல்களைக் கொண்டு செல்லும் ம" +
                            "ூலக்கூறு எது?",
                    options =
                        listOf(
                            "ஆர்.என்.ஏ (RNA)",
                            "டி.என்.ஏ (DNA)",
                            "புரதம் (Protein)",
                            "கார்போஹைட்ரேட்",
                        ),
                    answerIndex = 1,
                    rationale =
                        "டி.என்.ஏ (Deoxyribonucleic acid) உயிரினங்களின் மரபணு தகவல்கள" +
                            "ைச் சேமித்து கடத்துகிறது.",
                ),
                QuizQuestion(
                    question = "உயிரினங்களின் அடிப்படை அமைப்பும் தொழிற்பாடும் அலகு எது?",
                    options =
                        listOf(
                            "திசு (Tissue)",
                            "அவயம் (Organ)",
                            "செல் (Cell)",
                            "உயிரினம் (Organism)",
                        ),
                    answerIndex = 2,
                    rationale =
                        "செல் என்பது தன்னிச்சையாகப் பெருகக்கூடிய மிகச்சிறிய அலகு ஆகும" +
                            "்.",
                ),
                QuizQuestion(
                    question = "ஒளிச்சேர்க்கையின் போது தாவரங்கள் வெளியிடும் வாயு எது?",
                    options =
                        listOf(
                            "கார்பன் டை ஆக்சைடு",
                            "ஆக்ஸிஜன்",
                            "நைட்ரஜன்",
                            "ஹைட்ரஜன்",
                        ),
                    answerIndex = 1,
                    rationale =
                        "ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறுகள் உடைக்கப்படுவதால் ஆக" +
                            "்ஸிஜன் பக்கவிளைபொருளாக வெளியிடப்படுகிறது.",
                ),
            ),
            listOf(
                QuizQuestion(
                    question =
                        "குரோமோசோம் எண்ணிக்கை பாதியாகக் குறைக்கப்பட்ட நான்கு மகள் செல" +
                            "்களைத் தோற்றுவிக்கும் கலப்பிரிவு எது?",
                    options =
                        listOf(
                            "இழைப்பிரிவு (Mitosis)",
                            "ஒடுக்கற்பிரிவு (Meiosis)",
                            "இருமுனைப் பிளவு (Binary fission)",
                            "அரும்புதல் (Budding)",
                        ),
                    answerIndex = 1,
                    rationale =
                        "ஒடுக்கற்பிரிவு (Meiosis) என்பது ஒற்றைத்தொகுதி குரோமோசோம்களைக" +
                            "் கொண்ட கருமுட்டைகளைத் தோற்றுவிக்கும் ஒரு ஒடுக்கப் பிரிவாகும" +
                            "்.",
                ),
                QuizQuestion(
                    question = "இரத்த குளுக்கோஸ் அளவை கட்டுப்படுத்தும் ஹார்மோன் எது?",
                    options =
                        listOf(
                            "அட்ரினலின்",
                            "தைராக்சின்",
                            "இன்சுலின்",
                            "ஈஸ்ட்ரோஜன்",
                        ),
                    answerIndex = 2,
                    rationale =
                        "கணையத்தால் சுரக்கப்படும் இன்சுலின், செல்கள் இரத்தத்திலிருந்த" +
                            "ு குளுக்கோஸை உறிஞ்சுவதற்கு உதவுகிறது.",
                ),
                QuizQuestion(
                    question = "செங்கு루திச் சிறுதுணிக்கைகளின் (RBC) முக்கிய தொழில் யாது?",
                    options =
                        listOf(
                            "தொற்றை எதிர்த்தல்",
                            "குருதி உறைதல்",
                            "ஆக்ஸிஜனைக் கடத்துதல்",
                            "பொருளெதிரிகளை உருவாக்குதல்",
                        ),
                    answerIndex = 2,
                    rationale =
                        "செங்கு루திச் சிறுதுணிக்கைகளில் உள்ள ஹீமோகுளோபின் ஆக்ஸிஜனுடன் " +
                            "பிணைந்து அதை உடலின் திசுக்களுக்குக் கடத்துகிறது.",
                ),
                QuizQuestion(
                    question =
                        "ஆர்.என்.ஏ-வில் (RNA) உள்ள ஆனால் டி.என்.ஏ-வில் (DNA) இல்லாத ந" +
                            "ைட்ரஜன் காரம் எது?",
                    options =
                        listOf(
                            "அடினின் (Adenine)",
                            "யுராசில் (Uracil)",
                            "தைமின் (Thymine)",
                            "சைட்டோசின் (Cytosine)",
                        ),
                    answerIndex = 1,
                    rationale =
                        "ஆர்.என்.ஏ-வில் டி.என்.ஏ-விலுள்ள தைமினுக்குப் பதிலாக யுராசில்" +
                            " காணப்படுகிறது.",
                ),
                QuizQuestion(
                    question =
                        "பெண் இனப்பெருக்கத் தொகுதியில் கருக்கட்டல் பொதுவாக எங்கு நிகழ" +
                            "்கிறது?",
                    options =
                        listOf(
                            "சூலகம் (Ovary)",
                            "கருப்பை (Uterus)",
                            "பলোப்பியன் குழாய் (Fallopian tube)",
                            "யோனி (Vagina)",
                        ),
                    answerIndex = 2,
                    rationale =
                        "கருப்பைக்குள் முளையம் பதிவதற்கு முன்பு பொதுவாக பலோப்பியன் கு" +
                            "ழாயிலேயே கருக்கட்டல் நிகழ்கிறது.",
                ),
            ),
            listOf(
                QuizQuestion(
                    question =
                        "நுரையீரலிலிருந்து ஆக்ஸிஜன் செறிந்த குருதியை இதயத்திற்கு எடுத" +
                            "்துச் செல்லும் குருதிக்குழாய் எது?",
                    options =
                        listOf(
                            "நுரையீரல் தமனி",
                            "நுரையீரல் சிரை (Pulmonary vein)",
                            "பெருநாடி (Aorta)",
                            "பெருநாளம் (Vena cava)",
                        ),
                    answerIndex = 1,
                    rationale =
                        "நுரையீரல் சிரை மட்டுமே ஆக்ஸிஜன் செறிந்த குருதியை இடது சோணை அ" +
                            "றைக்குக் கொண்டு செல்கிறது.",
                ),
                QuizQuestion(
                    question =
                        "நீர் தாவரத்தின் ஊடாகச் சென்று அதன் வான்வழிப் பகுதிகளிலிருந்த" +
                            "ு ஆவியாகும் செயல்முறை எது?",
                    options =
                        listOf(
                            "இடப்பெயர்வு (Translocation)",
                            "சுவாசம் (Respiration)",
                            "நீராவிப்போக்கு (Transpiration)",
                            "உறிஞ்சுதல் (Absorption)",
                        ),
                    answerIndex = 2,
                    rationale =
                        "நீராவிப்போக்கு என்பது இலைகளிலிருந்து நீர் ஆவியாதல் ஆகும், இத" +
                            "ு வேர்களிலிருந்து நீரை மேலே இழுக்கிறது.",
                ),
                QuizQuestion(
                    question =
                        "பின்வருவனவற்றில் மனிதர்களால் வெளியேற்றப்படும் நைட்ரஜன் கழிவு" +
                            " எது?",
                    options =
                        listOf(
                            "அம்மோனியா",
                            "யூரியா",
                            "யூரிக் அமிலம்",
                            "கிரியேட்டினின்",
                        ),
                    answerIndex = 1,
                    rationale =
                        "மனிதர்கள் யூரியாவை வெளியேற்றும் உயிரினங்கள் ஆவர், முதன்மையாக" +
                            " யூரியா வடிவில் கழிவுகளை வெளியேற்றுகின்றனர்.",
                ),
                QuizQuestion(
                    question = "பெருங்குடலின் முக்கிய தொழில் யாது?",
                    options =
                        listOf(
                            "புரதச் செரிமானம்",
                            "நீர் உறிஞ்சுதல்",
                            "பித்த நீர் உற்பத்தி",
                            "ஊட்டச்சத்து உறிஞ்சுதல்",
                        ),
                    answerIndex = 1,
                    rationale =
                        "பெருங்குடல் சமிபாடடையாத உணவுப் பொருட்களிலிருந்து நீர் மற்றும" +
                            "் கனிம உப்புக்களை உறிஞ்சுகிறது.",
                ),
                QuizQuestion(
                    question = "பார்வை உணர்வுக்குப் பொறுப்பான மூளை நரம்பு எது?",
                    options =
                        listOf(
                            "நுகர்ச்சி நரம்பு",
                            "பார்வை நரம்பு (Optic nerve)",
                            "கண்இயக்க நரம்பு",
                            "முக நரம்பு",
                        ),
                    answerIndex = 1,
                    rationale =
                        "பார்வை நரம்பு (இரண்டாவது மூளை நரம்பு) விழித்திரையிலிருந்து க" +
                            "ாட்சித் தகவல்களை மூளைக்குக் கடத்துகிறது.",
                ),
            ),
        )

    private val chemistryPool =
        listOf(
            listOf(
                QuizQuestion(
                    question = "தங்கத்தின் இரசாயனக் குறியீடு என்ன?",
                    options =
                        listOf(
                            "Gd",
                            "Ag",
                            "Au",
                            "Fe",
                        ),
                    answerIndex = 2,
                    rationale = "Au என்பது லத்தீன் வார்த்தையான 'aurum' என்பதிலிருந்து வந்தது.",
                ),
                QuizQuestion(
                    question = "மிகக் குறைந்த அணுவெண்ணைக் கொண்ட மூலகம் எது?",
                    options =
                        listOf(
                            "ஹீலியம்",
                            "ஹைட்ரஜன்",
                            "லித்தியம்",
                            "பெரிலியம்",
                        ),
                    answerIndex = 1,
                    rationale = "ஹைட்ரஜன் 1 என்ற அணுவெண்ணைக் கொண்டுள்ளது.",
                ),
                QuizQuestion(
                    question = "25 °C இல் தூய நீரின் pH பெறுமானம் என்ன?",
                    options =
                        listOf(
                            "0",
                            "5",
                            "7",
                            "14",
                        ),
                    answerIndex = 2,
                    rationale = "தூய நீர் நடுநிலையானது, அறை வெப்பநிலையில் அதன் pH 7 ஆகும்.",
                ),
                QuizQuestion(
                    question = "பொதுவாக சிரிப்பூட்டும் வாயு என்று அழைக்கப்படும் வாயு எது?",
                    options =
                        listOf(
                            "நைட்ரிக் ஆக்சைடு",
                            "நைட்ரஜன் டை ஆக்சைடு",
                            "நைட்ரஸ் ஆக்சைடு",
                            "கார்பன் மோனாக்ஸைடு",
                        ),
                    answerIndex = 2,
                    rationale =
                        "நைட்ரஸ் ஆக்சைடு (N2O) அதன் மயக்கமூட்டும் விளைவுகளுக்காக பல் " +
                            "மருத்துவத்தில் பயன்படுத்தப்படுகிறது.",
                ),
                QuizQuestion(
                    question =
                        "அணுக்களுக்கிடையே இலத்திரன் சோடிகள் பகிரப்படுவதால் உருவாகும் " +
                            "பிணைப்பு எது?",
                    options =
                        listOf(
                            "அயனிப் பிணைப்பு",
                            "சகப்பிணைப்பு (Covalent)",
                            "ஹைட்ரஜன் பிணைப்பு",
                            "உலோகப் பிணைப்பு",
                        ),
                    answerIndex = 1,
                    rationale =
                        "சகப்பிணைப்பு அணுக்களுக்கிடையே இணைதிறன் இலத்திரன்கள் பகிரப்பட" +
                            "ுவதால் உருவாகிறது.",
                ),
            ),
            listOf(
                QuizQuestion(
                    question =
                        "வெப்பநிலை மாறாதபோது, அழுத்தம் கனவளவிற்கு எதிர்விகிதசமனானது எ" +
                            "னக் கூறும் விதி எது?",
                    options =
                        listOf(
                            "சார்லஸின் விதி",
                            "போயிலின் விதி (Boyle's Law)",
                            "அவகாதரோவின் விதி",
                            "டால்டனின் விதி",
                        ),
                    answerIndex = 1,
                    rationale = "போயிலின் விதி மாறா வெப்பநிலையில் P1V1 = P2V2 எனக் கூறுகிறது.",
                ),
                QuizQuestion(
                    question = "பெரும்பாலான சேர்வைகளில் ஆக்ஸிஜனின் ஆக்ஸியேற்ற நிலை என்ன?",
                    options =
                        listOf(
                            "0",
                            "-1",
                            "-2",
                            "+2",
                        ),
                    answerIndex = 2,
                    rationale =
                        "Oxygen typically gains two electrons to complete its octet, " +
                            "giving it an oxidation state of -2.",
                ),
                QuizQuestion(
                    question =
                        "காரக் கரைசல்களில் இளஞ்சிவப்பு (Pink) நிறமாக மாறும் காட்டி எத" +
                            "ு?",
                    options =
                        listOf(
                            "மீதைல் ஆரஞ்சு",
                            "லிட்மஸ் தாள்",
                            "பினோப்தலீன் (Phenolphthalein)",
                            "புரோமோதைமோல் நீலம்",
                        ),
                    answerIndex = 2,
                    rationale =
                        "பினோப்தலீன் காட்டி கார ஊடகத்தில் இளஞ்சிவப்பு நிறமாக மாறுகிறத" +
                            "ு.",
                ),
                QuizQuestion(
                    question = "அல்ககோலின் தொழிற்பாட்டுக் கூட்டம் எது?",
                    options =
                        listOf(
                            "-CHO",
                            "-COOH",
                            "-OH",
                            "-NH2",
                        ),
                    answerIndex = 2,
                    rationale =
                        "அல்ககோல்கள் கார்பன் அணுவுடன் பிணைக்கப்பட்ட ஹைட்ராக்சைல் (-OH" +
                            ") கூட்டத்தைக் கொண்டுள்ளன.",
                ),
                QuizQuestion(
                    question = "அறை வெப்பநிலையில் திரவமாக இருக்கும் உலோகம் எது?",
                    options =
                        listOf(
                            "காலியம்",
                            "பாதரசம் (Mercury)",
                            "சோடியம்",
                            "ஈயம்",
                        ),
                    answerIndex = 1,
                    rationale =
                        "பாதரசம் (Hg) குறைந்த உருகுநிலையைக் கொண்டிருப்பதால் அறை வெப்ப" +
                            "நிலையில் திரவமாக இருக்கும்.",
                ),
            ),
            listOf(
                QuizQuestion(
                    question =
                        "தாக்கத்தில் நுகரப்படாமல் தாக்க வீதத்தை teaspoons அதிகரிக்கும" +
                            "் பொருள் எவ்வாறு அழைக்கப்படும்?",
                    options =
                        listOf(
                            "தாக்கி",
                            "கரைப்பான்",
                            "ஊக்கி (Catalyst)",
                            "தடுப்பான்",
                        ),
                    answerIndex = 2,
                    rationale =
                        "ஒரு ஊக்கி தாக்கத்தின் ஏவற்சக்தியைக் குறைத்து தாக்க வீதத்தை அ" +
                            "திகரிக்கிறது.",
                ),
                QuizQuestion(
                    question =
                        "ஒற்றை அணு அடுக்கைக் கொண்ட மற்றும் அதிக கடத்துத்திறன் உடைய கா" +
                            "ர்பனின் புறவேற்றுமை வடிவம் எது?",
                    options =
                        listOf(
                            "வைரம்",
                            "கிராபைட்",
                            "கிராபீன் (Graphene)",
                            "புல்லரின்",
                        ),
                    answerIndex = 2,
                    rationale =
                        "கிராபீன் என்பது சிறந்த மின்சார பண்புகளைக் கொண்ட 2D கார்பன் அ" +
                            "டுக்கு ஆகும்.",
                ),
                QuizQuestion(
                    question = "ஹீலியம் அணுவின் இலத்திரன் நிலை அமைப்பு என்ன?",
                    options =
                        listOf(
                            "1s1",
                            "1s2",
                            "1s2 2s1",
                            "1s2 2s2",
                        ),
                    answerIndex = 1,
                    rationale =
                        "ஹீலியம் 2 இலத்திரன்களைக் கொண்டுள்ளதால் அதன் முதலாவது சக்தி ம" +
                            "ட்டம் (1s2) நிரம்பியுள்ளது.",
                ),
                QuizQuestion(
                    question = "ஒரு இரசாயன இனத்தால் இலத்திரன்கள் ஏற்கப்படும் தாக்கம் எது?",
                    options =
                        listOf(
                            "ஆக்ஸியேற்றம்",
                            "தாழ்த்தல் (Reduction)",
                            "நீர்ப்பகுப்பு",
                            "நடுநிலையாக்கல்",
                        ),
                    answerIndex = 1,
                    rationale = "தாழ்த்தல் என்பது இலத்திரன்களை ஏற்கும் தாக்கமாகும்.",
                ),
                QuizQuestion(
                    question = "இயற்கை வாயுவின் முக்கிய கூறு எது?",
                    options =
                        listOf(
                            "ஈதேன்",
                            "புரோப்பேன்",
                            "பியூட்டேன்",
                            "மீதேன் (Methane)",
                        ),
                    answerIndex = 3,
                    rationale =
                        "இயற்கை வாயுவில் மீதேன் (CH4) 70-90% வரை முதன்மைக் கூறாக உள்ள" +
                            "து.",
                ),
            ),
        )

    private val physicsPool =
        listOf(
            listOf(
                QuizQuestion(
                    question = "மின்னோட்டத்தின் SI அலகு என்ன?",
                    options =
                        listOf(
                            "வோல்ட்",
                            "அம்பியர் (Ampere)",
                            "ஓம்",
                            "வாட்",
                        ),
                    answerIndex = 1,
                    rationale = "மின்னோட்டத்தின் அடிப்படை SI அலகு அம்பியர் (A) ஆகும்.",
                ),
                QuizQuestion(
                    question = "வெற்றிடத்தில் ஒளியின் வேகம் என்ன?",
                    options =
                        listOf(
                            "300,000 km/s",
                            "150,000 km/s",
                            "3,000 km/s",
                            "30,000 km/s",
                        ),
                    answerIndex = 0,
                    rationale =
                        "ஒளியின் வேகம் நொடிக்கு சுமார் 300,000 கி.மீ (3 x 10^8 m/s) ஆ" +
                            "கும்.",
                ),
                QuizQuestion(
                    question =
                        "ஒவ்வொரு தாக்கத்திற்கும் சமனும் எதிருமான மறுதாக்கம் உண்டு எனக" +
                            "் கூறும் நியூட்டனின் விதி எது?",
                    options =
                        listOf(
                            "முதலாம் விதி",
                            "இரண்டாம் விதி",
                            "மூன்றாம் விதி (Third Law)",
                            "ஈர்ப்பு விதி",
                        ),
                    answerIndex = 2,
                    rationale =
                        "நியூட்டனின் மூன்றாம் விதி இரண்டு பொருட்களுக்கிடையிலான விசைச்" +
                            " சோடிகளை விவரிக்கிறது.",
                ),
                QuizQuestion(
                    question = "அதிர்வெண்ணின் அலகு என்ன?",
                    options =
                        listOf(
                            "ஜூல்",
                            "ஹெர்ட்ஸ் (Hertz)",
                            "நியூட்டன்",
                            "பாஸ்கல்",
                        ),
                    answerIndex = 1,
                    rationale =
                        "ஹெர்ட்ஸ் (Hz) என்பது ஒரு நொடிக்கான அலைவுகளின் எண்ணிக்கையைக் " +
                            "குறிக்கும்.",
                ),
                QuizQuestion(
                    question = "உந்த மாற்ற வீதத்தால் குறிக்கப்படும் பௌதிகக் கணியம் எது?",
                    options =
                        listOf(
                            "வேகம்",
                            "அமுக்கம்/முடுக்கம்",
                            "விசை (Force)",
                            "வேலை",
                        ),
                    answerIndex = 2,
                    rationale =
                        "நியூட்டனின் இரண்டாம் விதியின்படி, விசை உந்த மாற்ற வீதத்திற்க" +
                            "ு நேர்விகிதசமனானது.",
                ),
            ),
            listOf(
                QuizQuestion(
                    question = "வளியில் ஒலி அலைகள் எவ்வகையானவை?",
                    options =
                        listOf(
                            "குறுக்கலை",
                            "நெட்டலை (Longitudinal)",
                            "மின்காந்த அலை",
                            "முறுக்கல் அலை",
                        ),
                    answerIndex = 1,
                    rationale =
                        "ஒலி அலைகள் வளியில் நெருக்கல்களாகவும் தளர்வுகளாகவும் நெட்டலைக" +
                            "ளாகப் பயணிக்கின்றன.",
                ),
                QuizQuestion(
                    question =
                        "ஒரு மின்சுற்றில் மின்னோட்டத்தின் ஓட்டத்தைத் தடுக்கும் கூறு எ" +
                            "து?",
                    options =
                        listOf(
                            "மின் தேக்கி",
                            "தூண்டி",
                            "மின்தடையி (Resistor)",
                            "இருமுனையம்",
                        ),
                    answerIndex = 2,
                    rationale =
                        "மின்தடையி மின்னோட்டத்தைக் கட்டுப்படுத்த மின்சுற்றில் மின்தடை" +
                            "யை ஏற்படுத்துகிறது.",
                ),
                QuizQuestion(
                    question =
                        "10 N விசை ஒரு பொருளை விசையின் திசையில் 5 m நகர்த்தும்போது செ" +
                            "ய்யப்படும் வேலை என்ன?",
                    options =
                        listOf(
                            "2 J",
                            "15 J",
                            "50 J (Joules)",
                            "100 J",
                        ),
                    answerIndex = 2,
                    rationale = "வேலை = விசை x தூரம் = 10 N x 5 m = 50 ஜூல்.",
                ),
                QuizQuestion(
                    question = "பாகை செல்சியஸில் தனிச்சூன்ய வெப்பநிலை என்ன?",
                    options =
                        listOf(
                            "0 °C",
                            "-100 °C",
                            "-273.15 °C",
                            "-373.15 °C",
                        ),
                    answerIndex = 2,
                    rationale =
                        "தனிச்சூன்ய வெப்பநிலை 0 கெல்வின் ஆகும், இது -273.15 °C இற்குச" +
                            "் சமனாகும்.",
                ),
                QuizQuestion(
                    question = "வளிமண்டல அழுத்தத்தை அளவிடப் பயன்படும் கருவி எது?",
                    options =
                        listOf(
                            "வெப்பமானி",
                            "காற்றழுத்தமானி (Barometer)",
                            "அனிமோமீட்டர்",
                            "ஈரப்பதமானி",
                        ),
                    answerIndex = 1,
                    rationale = "காற்றழுத்தமானி வளிமண்டல அழுத்தத்தை அளவிடப் பயன்படுகிறது.",
                ),
            ),
            listOf(
                QuizQuestion(
                    question =
                        "திண்மப் பொருள் ஒன்றின் ஊடாக வெப்பம் கடத்தப்படும் முதன்மை முற" +
                            "ை எது?",
                    options =
                        listOf(
                            "வெப்பக்கடத்தல் (Conduction)",
                            "வெப்பச்சலனம் (Convection)",
                            "வெப்பக்கதிர்வீச்சு",
                            "வெப்பச்சேர்க்கை",
                        ),
                    answerIndex = 0,
                    rationale =
                        "திண்மங்களில் துகள்களின் நேரடித் தொடர்பு மூலம் வெப்பம் கடத்தப" +
                            "்படுவது வெப்பக்கடத்தல் ஆகும்.",
                ),
                QuizQuestion(
                    question =
                        "எப்போதும் மாய, நிமிர்ந்த மற்றும் சிறிய பிம்பத்தைத் தோற்றுவிக" +
                            "்கும் ஆடி எது?",
                    options =
                        listOf(
                            "குவி ஆடி (Convex mirror)",
                            "குழி ஆடி (Concave mirror)",
                            "சமதள ஆடி",
                            "பரவளைய ஆடி",
                        ),
                    answerIndex = 0,
                    rationale =
                        "Convex ஆடிகளிலிருந்து ஒளிக் கதிர்கள் விரிந்து செல்வதால் எப்ப" +
                            "ோதும் சிறிய மாய பிம்பங்கள் உருவாகின்றன.",
                ),
                QuizQuestion(
                    question = "வேக-நேர வரைபின் கீழான பரப்பு எதைக் குறிக்கிறது?",
                    options =
                        listOf(
                            "ஆர்முடுகல்",
                            "விசை",
                            "இடப்பெயர்ச்சி (Displacement)",
                            "வேகம்",
                        ),
                    answerIndex = 2,
                    rationale = "வேக-நேர வரைபின் பரப்பு இடப்பெயர்ச்சியைக் குறிக்கிறது.",
                ),
                QuizQuestion(
                    question = "பின்வருவனவற்றில் காவிப் கணியம் எது?",
                    options =
                        listOf(
                            "திணிவு",
                            "நேரம்",
                            "வெப்பநிலை",
                            "ஆர்முடுகல் (Acceleration)",
                        ),
                    answerIndex = 3,
                    rationale =
                        "ஆர்முடுகலுக்குப் பருடனும் திசையும் இருப்பதால் அது ஒரு காவிப்" +
                            " கணியம் ஆகும்.",
                ),
                QuizQuestion(
                    question = "திறனின் SI அலகு என்ன?",
                    options =
                        listOf(
                            "ஜூல்",
                            "வாட் (Watt)",
                            "குதிரைத்திறன்",
                            "வோல்ட்",
                        ),
                    answerIndex = 1,
                    rationale =
                        "திறனின் SI அலகு வாட் (W) ஆகும், இது ஒரு நொடியில் செய்யப்படும" +
                            "் வேலையைக் குறிக்கும்.",
                ),
            ),
        )

    private val mathsPool =
        listOf(
            listOf(
                QuizQuestion(
                    question = "இருபடிச் சமன்பாடு x^2 - 5x + 6 = 0 இன் மூலங்கள் யாவை?",
                    options =
                        listOf(
                            "1 மற்றும் 6",
                            "2 மற்றும் 3",
                            "-2 மற்றும் -3",
                            "-1 மற்றும் -6",
                        ),
                    answerIndex = 1,
                    rationale =
                        "காரணிப்படுத்தினால் (x-2)(x-3) = 0 ஆகும், எனவே மூலங்கள் x=2 ம" +
                            "ற்றும் x=3 ஆகும்.",
                ),
                QuizQuestion(
                    question = "x இன் சார்பாக x^3 இன் வகைக்கெழு (Derivative) என்ன?",
                    options =
                        listOf(
                            "3x",
                            "3x^2",
                            "x^2",
                            "3",
                        ),
                    answerIndex = 1,
                    rationale =
                        "வகைக்கெழு விதிப்படி d/dx(x^n) = n * x^(n-1), எனவே d/dx(x^3) " +
                            "= 3x^2 ஆகும்.",
                ),
                QuizQuestion(
                    question = "sin^2(θ) + cos^2(θ) இன் பெறுமானம் என்ன?",
                    options =
                        listOf(
                            "0",
                            "0.5",
                            "1",
                            "2",
                        ),
                    answerIndex = 2,
                    rationale = "இது திரிகோணகணிதத்தின் அடிப்படை முற்றொருமை ஆகும்.",
                ),
                QuizQuestion(
                    question =
                        "x ஆனது 0 ஐ அணுகும்போது sin(x)/x இன் எல்லை (Limit) பெறுமானம் " +
                            "என்ன?",
                    options =
                        listOf(
                            "0",
                            "0.5",
                            "1",
                            "எல்லை இல்லை",
                        ),
                    answerIndex = 2,
                    rationale =
                        "இது x=0 இல் sin(x) இன் வகைக்கெழுவைக் குறிக்கும் ஒரு அடிப்படை" +
                            " எல்லை ஆகும்.",
                ),
                QuizQuestion(
                    question =
                        "தாயகம் A இன் பரிமாணம் 2x3 மற்றும் தாயகம் B இன் பரிமாணம் 3x4 " +
                            "எனின், தாயகம் AB இன் பரிமாணம் என்ன?",
                    options =
                        listOf(
                            "2x3",
                            "3x3",
                            "2x4",
                            "3x4",
                        ),
                    answerIndex = 2,
                    rationale =
                        "நிரல்-நிரை எண்ணிக்கை பொருந்துவதால் தாயகப் பெருக்கம் 2x4 பரிம" +
                            "ாணத்தைக் கொண்டிருக்கும்.",
                ),
            ),
            listOf(
                QuizQuestion(
                    question = "அடி 10 இற்கு log(100) இன் பெறுமானம் என்ன?",
                    options =
                        listOf(
                            "1",
                            "2",
                            "10",
                            "100",
                        ),
                    answerIndex = 1,
                    rationale =
                        "10^2 = 100 என்பதால், அடி 10 இற்கு log(100) இன் பெறுமானம் 2 ஆ" +
                            "கும்.",
                ),
                QuizQuestion(
                    question =
                        "a = 1 மற்றும் r = 0.5 ஐக் கொண்ட முடிவிலி பெருக்குத் தொடரின் " +
                            "கூட்டுத்தொகை என்ன?",
                    options =
                        listOf(
                            "1.5",
                            "2",
                            "3",
                            "முடிவிலி",
                        ),
                    answerIndex = 1,
                    rationale =
                        "கூட்டுத்தொகை S = a / (1 - r) = 1 / (1 - 0.5) = 2 S = 2 ஆகும்" +
                            ".",
                ),
                QuizQuestion(
                    question = "x இன் சார்பாக e^(2x) இன் வகைக்கெழு என்ன?",
                    options =
                        listOf(
                            "e^(2x)",
                            "2e^x",
                            "2e^(2x)",
                            "e^x",
                        ),
                    answerIndex = 2,
                    rationale = "சங்கிலி விதிப்படி d/dx(e^(2x)) = 2e^(2x) ஆகும்.",
                ),
                QuizQuestion(
                    question = "cos(90°) இன் பெறுமானம் என்ன?",
                    options =
                        listOf(
                            "0",
                            "1",
                            "-1",
                            "0.5",
                        ),
                    answerIndex = 0,
                    rationale = "cos(90°) இன் பெறுமானம் சரியாக 0 ஆகும்.",
                ),
                QuizQuestion(
                    question = "x இன் சார்பாக 1/x இன் தொகையீடு (Integral) என்ன?",
                    options =
                        listOf(
                            "x",
                            "-1/x^2",
                            "ln|x| + C",
                            "1",
                        ),
                    answerIndex = 2,
                    rationale = "1/x இன் தொகையீடு இயற்கை மடக்கையான ln|x| + C ஆகும்.",
                ),
            ),
            listOf(
                QuizQuestion(
                    question =
                        "இருபடிச் சமன்பாடு x^2 + 4x + 4 = 0 இன் தன்மைகாட்டி (Discrimi" +
                            "nant) பெறுமானம் என்ன?",
                    options =
                        listOf(
                            "0",
                            "8",
                            "16",
                            "-16",
                        ),
                    answerIndex = 0,
                    rationale = "தன்மைகாட்டி D = b^2 - 4ac = 4^2 - 4(1)(4) = 0 ஆகும்.",
                ),
                QuizQuestion(
                    question =
                        "m1, m2 சரிவுகளைக் கொண்ட இரு கோடுகள் செங்குத்தாக இருப்பதைக் க" +
                            "ுறிக்கும் சமன்பாடு எது?",
                    options =
                        listOf(
                            "m1 = m2",
                            "m1 * m2 = 1",
                            "m1 * m2 = -1",
                            "m1 + m2 = 0",
                        ),
                    answerIndex = 2,
                    rationale =
                        "செங்குத்துக் கோடுகளின் சரிவுகளின் பெருக்கம் எப்போதும் -1 ஆகு" +
                            "ம்.",
                ),
                QuizQuestion(
                    question = "x இன் சார்பாக ln(x) இன் வகைக்கெழு என்ன?",
                    options =
                        listOf(
                            "e^x",
                            "1/x",
                            "x",
                            "ln(x)",
                        ),
                    answerIndex = 1,
                    rationale = "மடக்கைச் சார்பான ln(x) இன் வகைக்கெழு 1/x ஆகும்.",
                ),
                QuizQuestion(
                    question =
                        "4 வெவ்வேறு பொருட்களை ஒரே நேரத்தில் எடுக்கும்போது கிடைக்கும் " +
                            "வரிசைமாற்றங்களின் எண்ணிக்கை யாது?",
                    options =
                        listOf(
                            "4",
                            "12",
                            "24",
                            "16",
                        ),
                    answerIndex = 2,
                    rationale = "P = 4! = 4 x 3 x 2 x 1 = 24 ஆகும்.",
                ),
                QuizQuestion(
                    question = "x இன் சார்பாக cos(x) இன் வகைக்கெழு என்ன?",
                    options =
                        listOf(
                            "sin(x)",
                            "-sin(x)",
                            "cos(x)",
                            "-cos(x)",
                        ),
                    answerIndex = 1,
                    rationale = "கொசைன் (cosine) சார்பின் வகைக்கெழு எதிர் சைன் (-sine) ஆகும்.",
                ),
            ),
        )
}
