Pod::Spec.new do |spec|
  spec.name         = "NoibuSDK"
  spec.version      = "0.0.3"
  spec.summary      = "NoibuSDK"
  spec.description  = <<-DESC
  NoibuSDK provides session replay capabilities.
                   DESC
  spec.homepage     = "https://github.com/Noibu/noibu-ios"
  spec.license      = { :type => "MIT", :file => "LICENSE" }
  spec.author       = { "Jayven Nhan" => "jayven.nhan@noibu.com" }
  spec.platform     = :ios, "13.0"
  spec.swift_version = "5.0"
  spec.source       = { :git => "https://github.com/Noibu/noibu-ios.git", :tag => "#{spec.version}" }
  spec.vendored_frameworks = "NoibuSDK.xcframework"
end
