 export const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': 'bg-red-50 text-red-700 border-red-200',
      'A-': 'bg-red-50 text-red-700 border-red-200',
      'B+': 'bg-blue-50 text-blue-700 border-blue-200',
      'B-': 'bg-blue-50 text-blue-700 border-blue-200',
      'AB+': 'bg-purple-50 text-purple-700 border-purple-200',
      'AB-': 'bg-purple-50 text-purple-700 border-purple-200',
      'O+': 'bg-green-50 text-green-700 border-green-200',
      'O-': 'bg-green-50 text-green-700 border-green-200',
    };
    return colors[bloodType] || 'bg-gray-50 text-gray-700 border-gray-200';
  };