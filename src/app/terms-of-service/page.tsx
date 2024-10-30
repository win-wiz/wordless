export default function TermsOfService() {
  const t = {
    "title": "Wordless Terms of Service",
    "effective_date": "Effective Date: 2024-10-16",
    "overview": "Overview",
    "overview_description": "Welcome to wordless. By accessing our website (https://wordless.online), you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree to these terms of service, you are prohibited from using or accessing this website.",
    "acceptance_of_terms": "Acceptance of Terms",
    "acceptance_of_terms_description": "By using our website, you agree to accept these terms of service. If you do not agree to these terms of service, you are prohibited from using or accessing this website.",
    "acceptance_of_terms_description_1": "Modify or copy the materials;",
    "acceptance_of_terms_description_2": "Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);",
    "acceptance_of_terms_description_3": "Attempt to decompile or reverse engineer any software on our website;",
    "acceptance_of_terms_description_4": "Remove any copyright or other proprietary notations from the materials; or",
    "acceptance_of_terms_description_5": "Transfer the materials to another person or 'mirror' the materials on any other server.",
    "acceptance_of_terms_description_6": "If you violate any of these restrictions, your license to use our website is automatically terminated. We reserve the right to terminate this license at any time for any reason.",
    "disclaimer": "Disclaimer",
    "disclaimer_description": "The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all warranties, including but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other rights.",
    "limitations": "Limitations",
    "limitations_description": "In no event shall Wordless or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use our website or services, even if Wordless or a Wordless authorized representative has been notified orally or in writing of the possibility of such damages.",
    "material_accuracy": "Material Accuracy",
    "material_accuracy_description": "The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our website are accurate, complete, or current. We may change the materials on our website at any time without notice. However, we do not make any commitment to update the materials.",
    "links": "Links",
    "links_description": "We do not review or monitor the content of any third-party websites linked to our website. We are not responsible for any content on any third-party websites linked to our website.",
    "modifications": "Modifications",
    "modifications_description": " reserves the right to modify these Terms of Service at any time without prior notice. By using our website, you agree to be bound by the current version of these Terms of Service.",
    "governing_law": "Governing Law",
    "governing_law_description": "These terms and conditions are governed by and construed in accordance with the laws of the State of California, USA, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.",
    "contact_us": "Contact Us",
    "contact_us_description": "If you have any questions about these terms of service, please contact us at support@subrise.co."
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white py-16 md:py-20">
      <div className="container mx-auto max-w-4xl px-4">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-zinc-800 to-violet-500 bg-clip-text text-transparent">
            {t['title']}
          </h1>
          <div className="mt-2 w-20 h-1 bg-violet-200 mx-auto rounded-full"></div>
          <p className="mt-4 text-zinc-500">{t['effective_date']}</p>
        </div>

        {/* 内容区域 */}
        <div className="space-y-8 bg-white/50 rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Overview Section */}
          <section>
            <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['overview']}</h2>
            <p className="text-zinc-600 leading-relaxed">{t['overview_description']}</p>
          </section>

          {/* Acceptance of Terms Section */}
          <section className="bg-white rounded-xl p-6">
            <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['acceptance_of_terms']}</h2>
            <div className="space-y-4">
              <p className="text-zinc-600">{t['acceptance_of_terms_description']}</p>
              <div className="ml-4 space-y-2">
                <p className="text-zinc-600">You may not:</p>
                <ul className="list-disc list-inside space-y-2 text-zinc-600 ml-4">
                  <li>{t['acceptance_of_terms_description_1']}</li>
                  <li>{t['acceptance_of_terms_description_2']}</li>
                  <li>{t['acceptance_of_terms_description_3']}</li>
                  <li>{t['acceptance_of_terms_description_4']}</li>
                  <li>{t['acceptance_of_terms_description_5']}</li>
                </ul>
              </div>
              <p className="text-zinc-600">{t['acceptance_of_terms_description_6']}</p>
            </div>
          </section>

          {/* Other Sections */}
          <section className="space-y-6">
            {/* Disclaimer */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['disclaimer']}</h2>
              <p className="text-zinc-600">{t['disclaimer_description']}</p>
            </div>

            {/* Limitations */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['limitations']}</h2>
              <p className="text-zinc-600">{t['limitations_description']}</p>
            </div>

            {/* Material Accuracy */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['material_accuracy']}</h2>
              <p className="text-zinc-600">{t['material_accuracy_description']}</p>
            </div>

            {/* Links */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['links']}</h2>
              <p className="text-zinc-600">{t['links_description']}</p>
            </div>

            {/* Modifications */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['modifications']}</h2>
              <p className="text-zinc-600">{t['modifications_description']}</p>
            </div>

            {/* Governing Law */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['governing_law']}</h2>
              <p className="text-zinc-600">{t['governing_law_description']}</p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-violet-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-violet-900 mb-4">{t['contact_us']}</h2>
            <p className="text-violet-700">{t['contact_us_description']}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
