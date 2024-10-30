export default function PrivacyPolicy() {

  const t = {
    "title": "Wordless Privacy Policy",
    "effective_date": "Effective Date: 2024-10-16",
    "overview": "Overview",
    "overview_description": "Subrise operates the website https://subrise.co/ and is committed to protecting your privacy. This privacy policy outlines the types of information we collect, how we use this information, and the steps we take to ensure your personal information is appropriately processed.",
    "information_collection": "Information Collection",
    "personal_data": "Personal Data",
    "personal_data_description": "We collect personal data voluntarily provided by you, including but not limited to:",
    "personal_data_description_1": "Name",
    "personal_data_description_2": "Email Address",
    "personal_data_description_3": "Payment Information",
    "personal_data_description_4": "These information are collected for processing orders on our Subrise navigation site.",
    "non_personal_data": "Non-Personal Data",
    "non_personal_data_description": "We also collect non-personal data through web cookies, including your IP address, browser type, and details of the pages you visit on our website. This data is used to enhance your experience on our website.",
    "data_collection_purpose": "Data Collection Purpose",
    "data_collection_purpose_description": "The main purpose of collecting your data is to process your orders and improve the functionality and services of our website.",
    "data_sharing": "Data Sharing",
    "data_sharing_description": "Subrise respects your privacy. We will not share your personal data with any third parties, unless necessary to process your orders or comply with legal requirements.",
    "children_privacy": "Children Privacy",
    "children_privacy_description": "Our services are not intended for children under 18 years of age. We do not intentionally collect personal information from children.",
    "privacy_policy_update": "Privacy Policy Update",
    "privacy_policy_update_description": "We may update our privacy policy periodically. We will notify you of any changes by posting the updated privacy policy on this page and updating the 'Effective Date' at the top of the page. We will also notify you of significant changes via email.",
    "contact_us": "Contact Us",
    "contact_us_description": "If you have any questions or concerns about this privacy policy, please contact us at support@subrise.co."
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

          {/* Information Collection Section */}
          <section>
            <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['information_collection']}</h2>
            
            <div className="space-y-6">
              {/* Personal Data */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-semibold text-zinc-800 mb-3">{t['personal_data']}</h3>
                <p className="text-zinc-600 mb-4">{t['personal_data_description']}</p>
                <ul className="list-disc list-inside space-y-2 text-zinc-600 ml-4">
                  <li>{t['personal_data_description_1']}</li>
                  <li>{t['personal_data_description_2']}</li>
                  <li>{t['personal_data_description_3']}</li>
                </ul>
                <p className="mt-4 text-zinc-600">{t['personal_data_description_4']}</p>
              </div>

              {/* Non-Personal Data */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-semibold text-zinc-800 mb-3">{t['non_personal_data']}</h3>
                <p className="text-zinc-600">{t['non_personal_data_description']}</p>
              </div>
            </div>
          </section>

          {/* Other Sections */}
          <section className="space-y-6">
            {/* Data Collection Purpose */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['data_collection_purpose']}</h2>
              <p className="text-zinc-600">{t['data_collection_purpose_description']}</p>
            </div>

            {/* Data Sharing */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['data_sharing']}</h2>
              <p className="text-zinc-600">{t['data_sharing_description']}</p>
            </div>

            {/* Children Privacy */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['children_privacy']}</h2>
              <p className="text-zinc-600">{t['children_privacy_description']}</p>
            </div>

            {/* Privacy Policy Update */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">{t['privacy_policy_update']}</h2>
              <p className="text-zinc-600">{t['privacy_policy_update_description']}</p>
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
