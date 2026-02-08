import { useParams, Link } from 'react-router-dom';

const Certificate = () => {
  const { certificateId } = useParams();

  // Mock certificate data
  const certificate = {
    id: certificateId,
    courseName: 'Web Development Fundamentals',
    studentName: 'John Doe',
    issueDate: 'January 15, 2026',
    certificateNumber: 'CLA-2026-001234',
    instructor: 'Dr. Sarah Mitchell',
  };

  const handleDownload = () => {
    alert('Download functionality would be implemented here');
  };

  const handleShare = () => {
    alert('Share functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/skill-passport"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Skill Passport
          </Link>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 border-8 border-double border-primary-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mb-4">
              <span className="text-white font-bold text-4xl">C</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              CrushLearn <span className="text-primary-600">AI</span>
            </h1>
            <p className="text-gray-600 text-lg">Certificate of Completion</p>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-primary-200 my-8"></div>

          {/* Body */}
          <div className="text-center space-y-6">
            <p className="text-gray-700 text-lg">This is to certify that</p>

            <h2 className="text-5xl font-bold text-gray-900 py-4">
              {certificate.studentName}
            </h2>

            <p className="text-gray-700 text-lg">
              has successfully completed the course
            </p>

            <h3 className="text-3xl font-bold text-primary-700 py-2">
              {certificate.courseName}
            </h3>

            <p className="text-gray-600">
              demonstrating exceptional commitment to learning and skill
              development
            </p>

            {/* Date and Signature */}
            <div className="pt-8 flex items-center justify-around">
              <div>
                <p className="text-gray-900 font-semibold mb-2">
                  {certificate.issueDate}
                </p>
                <p className="text-gray-600 text-sm">Date</p>
              </div>

              <div className="h-16 border-l-2 border-gray-300"></div>

              <div>
                <p className="text-gray-900 font-semibold mb-2 italic">
                  {certificate.instructor}
                </p>
                <p className="text-gray-600 text-sm">Course Instructor</p>
              </div>
            </div>

            {/* Certificate Number */}
            <div className="pt-6">
              <p className="text-gray-500 text-sm">
                Certificate No: {certificate.certificateNumber}
              </p>
            </div>
          </div>

          {/* Seal/Badge */}
          <div className="absolute top-8 right-8 hidden md:block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-yellow-700 shadow-lg">
              <div className="text-center">
                <div className="text-3xl">🏆</div>
                <p className="text-xs font-bold text-yellow-900">VERIFIED</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center space-x-4">
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition shadow-lg flex items-center space-x-2"
          >
            <span>📥</span>
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleShare}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-lg flex items-center space-x-2"
          >
            <span>🔗</span>
            <span>Share on LinkedIn</span>
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            This certificate can be verified at crushlearn.ai/verify/{certificate.certificateNumber}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
